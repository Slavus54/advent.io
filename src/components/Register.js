import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {REGIONS, REGISTER_STAGES} from '../constants/constants'

const Register = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [search, setSearch] = useState('')
    const [stage_idx, setStageIdx] = useState(0)
    const [daten, setDaten] = useState({
        name: '',
        password: '',
        region: REGIONS[0].title,
        cords: {
            lat: 0,
            long: 0
        },
        personal_photo: '',
        domain: REGIONS[0].domain
    })

    const {name, password, region, cords, personal_photo, domain} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const registerM = gql`
        mutation register($name: String!, $password: String!, $region: String!, $cords: Cords!, $personal_photo: String!, $domain: String!) {
            register(name: $name, password: $password, region: $region, cords: $cords, personal_photo: $personal_photo, domain: $domain) {
                platform_id
                name
                domain
            }
        }
    `

    const [register] = useMutation(registerM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.register !== undefined) {
                console.log(result.data.register)

                let inst = new CookieWorker('profile')

                inst.save(result.data.register, 72)

                setLoc('/')
                window.location.reload()
            }
        }
    })

    useMemo(() => {
        if (region !== '') {
            let item = REGIONS.find(el => el.title === region)

            if (item !== null) {
                setView({...view, latitude: item.cords.lat, longitude: item.cords.long, zoom: 11})
                setDaten({...daten, region: item.title, domain: item.domain})
            }           
        }
    }, [user, region])

    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setDaten({...daten, personal_photo: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const setCords = e => {
        setDaten({...daten, cords: {
            lat: e.lngLat[1],
            long: e.lngLat[0]
        }})
    }

    const onRegister = () => {
        register({
			variables: {
				name, password, region, cords, personal_photo, domain
			}
		})
	}  
    
    return (
        <div className='main'>
            {user === null &&
                <>
                    <h1>Создайте ваш профиль</h1>
                    <input value={name} onChange={e => setDaten({...daten, name: e.target.value})} placeholder='Ваше имя' className='inp' />
                    <input value={password} onChange={e => setDaten({...daten, password: e.target.value})} placeholder='Ваш пароль' className='inp' />

        
                    <div className='items_half'>
                        <button onClick={() => stage_idx > 0 && setStageIdx(stage_idx - 1)} className='btn'>Назад</button>
                        <h2>{REGISTER_STAGES[stage_idx]}</h2>
                        <button onClick={() => stage_idx < REGISTER_STAGES.length - 1 && setStageIdx(stage_idx + 1)} className='btn'>Далее</button>
                    </div>
                
                    {REGISTER_STAGES[stage_idx] === 'Место' && REGIONS.length <= 5 &&
                        <>
                            <h3>Выберите свой регион</h3>
                            <select value={region} onChange={e => setDaten({...daten, region: e.target.value})}>
                                {REGIONS.map(el => <option value={el.title}>{el.title} ({el.domain})</option>)}
                            </select>
                            <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                                <Marker latitude={cords.lat} longitude={cords.long}>
                                    <b>*</b>
                                </Marker>
                            </ReactMapGL>
                        </>
                    }

                    {REGISTER_STAGES[stage_idx] === 'Место' && REGIONS.length > 5 &&
                        <>
                            <h3>Найдите свой регион</h3>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Название региона' className='inp' />
                            <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'> 
                                <Marker latitude={cords.lat} longitude={cords.long}>
                                    <b>*</b>
                                </Marker>
                            </ReactMapGL>
                        </>
                    }

                    {REGISTER_STAGES[stage_idx] === 'Фото профиля' && <input onChange={onUpload} type='file' className='inp' />}                  

                    <button onClick={onRegister} className='btn'>Создать</button>
                </>
            }
        </div>
    )
}

export default Register