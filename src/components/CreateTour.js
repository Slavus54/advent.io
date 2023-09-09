import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import shortid from 'shortid'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {DataPicker} from '../libs/DataPicker'
import {TOUR_TYPES, COORDINATE_FORMATS, SURFACES, REGIONS, LEVELS, TIME_BORDERS, haversine, convert} from '../constants/constants'

const CreateTour = ({params}) => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [timer, setTimer] = useState(TIME_BORDERS[0])
    const [date_idx, setDateIdx] = useState(0)
    const [coordinate, setCoordinate] = useState({
        id: '',
        surface_type: SURFACES[0],
        format: COORDINATE_FORMATS[0],
        dot: {
            lat: 0,
            long: 0
        }
    })
    const [daten, setDaten] = useState({
        title: '',
        category: TOUR_TYPES[0],
        level: LEVELS[0],
        region: REGIONS[0].title,
        cords: {
            lat: 0,
            long: 0
        },
        coordinates: [],
        distance: 0,
        date: new DataPicker().format('letter'),
        time: ''
    })

    const {title, category, level, region, cords, coordinates, distance, date, time} = daten
    const {id, surface_type, format, dot} = coordinate

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const createTourM = gql`
        mutation createTour($name: String!, $id: String!, $title: String!, $category: String!, $level: String!, $region: String!, $cords: Cords!, $coordinates: [ICoordinate]!, $distance: Float!, $date: String!, $time: String!) {
            createTour(name: $name, id: $id, title: $title, category: $category, level: $level, region: $region, cords: $cords, coordinates: $coordinates, distance: $distance, date: $date, time: $time)
        }
    `

    const [createTour] = useMutation(createTourM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.createTour !== undefined) {
                console.log(result.data.createTour)

                setLoc('/')
                window.location.reload()
            }
        }
    })

    useMemo(() => {
        if (region !== '') {
            let item = REGIONS.find(el => el.title === region)

            if (item !== null) {
                setView({...view, latitude: item.cords.lat, longitude: item.cords.long, zoom: 13})
            }           
        }
    }, [user, region])

    useMemo(() => {
        if (id === '') {
            setCoordinate({...coordinate, id: shortid.generate().toString()})    
        }
    }, [surface_type, format])

    useMemo(() => {
        setDaten({...daten, date: new DataPicker().move('завтра', '+', date_idx).format('letter')})
    }, [date_idx])

    useMemo(() => {
        setDaten({...daten, time: convert(timer)})
    }, [timer])

    const setCords = e => {
        if (cords.lat === 0) {
            setDaten({...daten, cords: {
                lat: e.lngLat[1],
                long: e.lngLat[0]
            }})
        } else {
            setCoordinate({...coordinate, dot: {
                lat: e.lngLat[1],
                long: e.lngLat[0]
            }})
        }
       
    }

    const onAddCoordinate = () => {
        let size = 0

        if (coordinates.length === 0) {
            size = haversine(cords.lat, cords.long, dot.lat, dot.long)
        } else {
            let last = coordinates[coordinates.length - 1]

            size = haversine(last.dot.lat, last.dot.long, dot.lat, dot.long)
        }

        size = parseFloat(size.toFixed(1))

        setDaten({...daten, coordinates: [...coordinates, coordinate], distance: distance + size})

        setCoordinate({
            id: '',
            surface_type: SURFACES[0],
            format: COORDINATE_FORMATS[0],
            dot: {
                lat: 0,
                long: 0
            }
        })
    }

    const onCreate = () => {
        createTour({
            variables: {
                name: user.name, id: params.id, title, category, level, region, cords, coordinates, distance, date, time
            }
        })
	}  
    
    return (
        <div className='main'>
            {user !== null &&
                <>
                    <h1>Создайте тур</h1>
                    <input value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Название тура' className='inp' />

                    <div className='items_half'>
                        <div className='item'>
                            <h3>Категория</h3>
                            <select value={category} onChange={e => setDaten({...daten, category: e.target.value})}>
                                {TOUR_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                    
                        <div className='item'>
                            <h3>Уровень сложности</h3>
                            <select value={level} onChange={e => setDaten({...daten, level: e.target.value})}>
                                {LEVELS.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                     
                    </div>
                  
                    {cords.lat === 0 ? 
                            <>
                                <h2>Регион и место старта</h2>
                                <select value={region} onChange={e => setDaten({...daten, region: e.target.value})}>
                                    {REGIONS.map(el => <option value={el.title}>{el.title} ({el.domain})</option>)}
                                </select>
                            </>
                        :
                            <>
                                <h2>Добавьте точки маршрута</h2>
                                <div className='items_half'>
                                    <div className='item'>
                                        <h3>Поверхность</h3>
                                        <select value={surface_type} onChange={e => setCoordinate({...coordinate, surface_type: e.target.value})}>
                                            {SURFACES.map(el => <option value={el}>{el}</option>)}
                                        </select>
                                    </div>

                                    <div className='item'>
                                        <h3>Действие</h3>
                                        <select value={format} onChange={e => setCoordinate({...coordinate, format: e.target.value})}>
                                            {COORDINATE_FORMATS.map(el => <option value={el}>{el}</option>)}
                                        </select>
                                    </div>                                
                                </div>
                                <button onClick={onAddCoordinate} className='btn'>+</button>
                            </>
                    }
                    <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <b>Старт</b>
                        </Marker>
                        <Marker latitude={dot.lat} longitude={dot.long}>
                            <b>*</b>
                        </Marker>
                        {coordinates.map(el => (
                            <Marker latitude={el.dot.lat} longitude={el.dot.long}>
                                <b>*</b>
                            </Marker>
                        ))}
                    </ReactMapGL>
                    <h3>{distance} км</h3>
                   
                    <h2>Дата и время</h2>
                    <div className='items_half'>
                        <button onClick={() => date_idx > 0 && setDateIdx(date_idx - 1)} className='btn'>-</button>
                        <h3>{date}</h3>
                        <button onClick={() => date_idx < 10 && setDateIdx(date_idx + 1)} className='btn'>+</button>
                    </div>
                    <div className='items_half'>
                        <button onClick={() => timer > TIME_BORDERS[0] && setTimer(timer - 30)} className='btn'>Раньше</button>
                        <h3>{time}</h3>
                        <button onClick={() => timer < TIME_BORDERS[1] && setTimer(timer + 30)} className='btn'>Позже</button>
                    </div>
                     

                    <button onClick={onCreate} className='btn'>Создать</button>
                </>
            }
        </div>
    )
}

export default CreateTour