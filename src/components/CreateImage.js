import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import shortid from 'shortid'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {DataPicker, periods} from '../libs/DataPicker'
import {DAMAGE_TYPES, REGIONS} from '../constants/constants'

const CreateImage = ({params}) => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [period, setPeriod] = useState(periods[0])
    const [date_idx, setDateIdx] = useState(0)
    const [daten, setDaten] = useState({
        title: '',
        category: DAMAGE_TYPES[0],
        url: '',
        date: new DataPicker().format('letter'),
        region: REGIONS[0].title,
        cords: {
            lat: 0,
            long: 0
        }
    })

    const {title, category, url, date, region, cords} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const createImageM = gql`
        mutation createImage($name: String!, $id: String!, $title: String!, $category: String!, $url: String!, $date: String!, $region: String!, $cords: Cords!)  {
            createImage(name: $name, id: $id, title: $title, category: $category, url: $url, date: $date, region: $region, cords: $cords) 
        }
    `

    const [createImage] = useMutation(createImageM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.createImage !== undefined) {
                console.log(result.data.createImage)

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
        setDaten({...daten, date: new DataPicker().move(period.title, '+', date_idx).format('letter')})
    }, [period, date_idx])

    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setDaten({...daten, url: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const setCords = e => {
        setDaten({...daten, cords: {
            lat: e.lngLat[1],
            long: e.lngLat[0]
        }})       
    }

    const onCreate = () => {
        createImage({
            variables: {
                name: user.name, id: params.id, title, category, url, date, region, cords
            }
        })
	}  
    
    return (
        <div className='main'>
            {user !== null &&
                <>
                    <h1>Отпечаток войны</h1>
                    <textarea value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Опишите фото' className='inp' />
                    <select value={category} onChange={e => setDaten({...daten, category: e.target.value})}>
                        {DAMAGE_TYPES.map(el => <option value={el}>{el}</option>)}
                    </select>
    
                    <input onChange={onUpload} type='file' className='inp' />
       
                    <h2>Регион и место</h2>
                    <select value={region} onChange={e => setDaten({...daten, region: e.target.value})}>
                        {REGIONS.filter(el => el.domain === 'ua').map(el => <option value={el.title}>{el.title} ({el.domain})</option>)}
                    </select>              
                    <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <b>*</b>
                        </Marker>
                    </ReactMapGL>
  
                    <h2>Дата</h2>
                    <div className='items_half'>
                        <button onClick={() => setDateIdx(date_idx - 1)} className='btn'>Раньше</button>
                        <h3>{date}</h3>
                        <button onClick={() => setDateIdx(date_idx + 1)} className='btn'>Позже</button>
                    </div>
                    <div className='items_half'>
                        {periods.filter(el => !el.isChangeUsed).map(el => <b onClick={() => setPeriod(el)} className='item_card'>{el.title}</b>)}
                    </div>
                   
                     

                    <button onClick={onCreate} className='btn'>Создать</button>
                </>
            }
        </div>
    )
}

export default CreateImage