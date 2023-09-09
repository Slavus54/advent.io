import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {REGIONS, TOUR_TYPES, LEVELS} from '../constants/constants'

const Tours = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState(TOUR_TYPES[0])
    const [level, setLevel] = useState(LEVELS[0])
    const [region, setRegion] = useState(REGIONS[0].title)
    const [distance, setDistance] = useState(50)
    const [user, setUser] = useState(null)
    const [tours, setTours] = useState(null)
    const [filtered, setFiltered] = useState([])

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const getToursM = gql`
        mutation getTours($name: String!) {
            getTours(name: $name) {
                shortid
                creator
                title
                category
                level
                region
                cords {
                    lat
                    long
                }
                coordinates {
                    id
                    surface_type
                    format
                    dot {
                        lat
                        long
                    }
                }
                distance
                date
                time
                members {
                    platform_id
                    name
                    role
                    item_id
                    personal_photo
                }
                chat {
                    name
                    interlocutor
                    variant
                    text
                }
                photos {
                    id
                    name
                    title
                    category
                    cords {
                        lat
                        long
                    }
                    photo_url
                    likes
                }
                items {
                    id
                    name
                    title
                    category
                    uses
                }
            }
        }
    ` 

    const [getTours] = useMutation(getToursM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getTours !== undefined) {
                console.log(result.data.getTours)
                setTours(result.data.getTours)
                setFiltered(result.data.getTours)
            }
        }
    })  

    useEffect(() => {
        if (user !== null) {
            getTours({
                variables: {
                    name: user.name
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (tours !== null) {
            let result = tours.filter(el => el.region === region && el.level === level && el.category === category)
            let max = parseInt(distance / 10)

            result = result.filter(el => el.distance <= max)

            if (title !== '') {
                result = result.filter(el => el.title.toLowerCase().includes(title.toLowerCase()) && parseInt(el.title.length / 3) <= title.length)
            }

            setFiltered(result)
        }
    }, [tours, title, category, level, region, distance])

    useMemo(() => {
        if (region !== '') {
            let item = REGIONS.find(el => el.title === region)

            if (item !== null) {
                setView({...view, latitude: item.cords.lat, longitude: item.cords.long, zoom: 11})
            }           
        }
    }, [tours, region])

    return (
        <div className='main'>
            {tours === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && tours !== null &&
                <>                        
                    <h1>Найдите компаньона</h1>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Название тура' className='inp' />
                    <div className='items_half'>
                        <div className='item'>
                            <h3>Тип</h3>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                {TOUR_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                        <div className='item'>
                            <h3>Уровень сложности</h3>
                            <select value={level} onChange={e => setLevel(e.target.value)}>
                                {LEVELS.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                        <div className='item'>
                            <h3>Регион</h3>
                            <select value={region} onChange={e => setRegion(e.target.value)}>
                                {REGIONS.map(el => <option value={el.title}>{el.title} ({el.domain})</option>)}
                            </select>
                        </div>                       
                    </div>
                    <h3>Дистанция: {parseFloat((distance / 10).toFixed(1))} км</h3>
                    <input value={distance} onChange={e => setDistance(e.target.value)} type='range' step={2} className='inp' />
                    <ReactMapGL {...view} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        {filtered.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => setLoc(`/tour/${el.shortid}`)}>{el.title}</b>
                            </Marker>
                        ))}
                    </ReactMapGL>
                </>
            }
        </div>
    )
}

export default Tours