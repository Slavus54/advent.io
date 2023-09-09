import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {REGIONS} from '../constants/constants'

const Profiles = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [name, setName] = useState('')
    const [region, setRegion] = useState(REGIONS[0].title)
    const [isMyDomain, setIsMyDomain] = useState(false)
    const [user, setUser] = useState(null)
    const [profiles, setProfiles] = useState(null)
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

    const getProfilesM = gql`
        mutation getProfiles($name: String!) {
            getProfiles(name: $name) {
                platform_id
                name
                region
                cords {
                    lat
                    long
                }
                domain
            }
        }
    ` 

    const [getProfiles] = useMutation(getProfilesM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getProfiles !== undefined) {
                console.log(result.data.getProfiles)
                setProfiles(result.data.getProfiles)
                setFiltered(result.data.getProfiles)
            }
        }
    })  

    useEffect(() => {
        if (user !== null) {
            getProfiles({
                variables: {
                    name: user.name
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (profiles !== null) {
            let result = profiles

            if (isMyDomain) {
                result = result.filter(el => el.domain === user.domain)
            } else {
                result = result.filter(el => el.region === region)
            }

            if (name !== '') {
                result = result.filter(el => el.name.toLowerCase().includes(name.toLowerCase()) && parseInt(el.name.length / 3) <= name.length)
            }

            setFiltered(result)
        }
    }, [profiles, name, isMyDomain, region])

    useMemo(() => {
        if (region !== '') {
            let item = REGIONS.find(el => el.title === region)

            if (item !== null) {
                setView({...view, latitude: item.cords.lat, longitude: item.cords.long, zoom: 11})
            }           
        }
    }, [profiles, region])

    const onRedirect = id => {
        if (user.platform_id === id) {
            setLoc('/')
        } else {
            setLoc(`/profile/${id}/none`)
        }
    }

    return (
        <div className='main'>
            {profiles === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && profiles !== null &&
                <>                        
                    <h1>Найдите компаньона</h1>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder='Имя пользователя' className='inp' />
                    <button onClick={() => setIsMyDomain(!isMyDomain)} className='btn'>{isMyDomain ? 'Иной' : 'Мой'} домен</button>
                    {!isMyDomain && 
                        <select value={region} onChange={e => setRegion(e.target.value)}>
                            {REGIONS.map(el => <option value={el.title}>{el.title} ({el.domain})</option>)}
                        </select>
                    }
                    <ReactMapGL {...view} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        {filtered.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => onRedirect(el.platform_id)}>{el.name}</b>
                            </Marker>
                        ))}
                    </ReactMapGL>
                </>
            }
        </div>
    )
}

export default Profiles