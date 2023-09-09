import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {REGIONS, GOALS, haversine} from '../constants/constants'

const Images = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [region, setRegion] = useState(REGIONS[0].title)
    const [distance, setDistance] = useState(1)
    const [percent, setPercent] = useState(50)
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [images, setImages] = useState(null)
    const [image, setImage] = useState(null)
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

    const getImagesM = gql`
        mutation getImages($name: String!) {
            getImages(name: $name) {
                shortid
                creator
                title
                category
                url
                date
                region
                cords {
                    lat
                    long
                }
                points
            }
        }
    ` 

    const getProfileM = gql`
        mutation getProfile($platform_id: String!) {
            getProfile(platform_id: $platform_id) {
                platform_id
                name
                domain
                distance
            }
        }
    ` 

    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getProfile !== undefined) {
                console.log(result.data.getProfile)
                setProfile(result.data.getProfile)
            }
        }
    })  

    const [getImages] = useMutation(getImagesM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getImages !== undefined) {
                console.log(result.data.getImages)
                setImages(result.data.getImages)
            }
        }
    })  

    useEffect(() => {
        if (user !== null) {
            getImages({
                variables: {
                    name: user.name
                }
            })

            getProfile({
                variables: {
                    platform_id: user.platform_id
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (images !== null && region !== '') {
            let result = images.filter(el => el.region === region)
            let item = REGIONS.find(el => el.title === region)

            if (item !== null) {

                result = result.filter(el => {
                    let size = haversine(item.cords.lat, item.cords.long, el.cords.lat, el.cords.long)

                    return size <= distance
                })

                setView({...view, latitude: item.cords.lat, longitude: item.cords.long, zoom: 11})
            }           

            setFiltered(result)
        }
    }, [images, region, distance])

    useMemo(() => {
        if (profile !== null) {
           setDistance(parseFloat((percent / 100) * profile.distance).toFixed(1))
        }
    }, [profile, percent])

    return (
        <div className='main'>
            {images === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && images !== null && profile !== null &&
                <>                        
                    <h1>Панорама из города {region}</h1>
                    <select value={region} onChange={e => setRegion(e.target.value)}>
                        {REGIONS.filter(el => el.domain === 'ua').map(el => <option value={el.title}>{el.title} ({el.domain})</option>)}
                    </select>
                    <h2>Радиус: {distance} км</h2>
                    <input value={percent} onChange={e => setPercent(parseInt(e.target.value))} step={5} type='range' className='inp' />
                    <ReactMapGL {...view} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        {filtered.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => setImage(el)}>{el.title}</b>
                            </Marker>
                        ))}
                    </ReactMapGL>

                    {image !== null && 
                        <>
                            <h2>{image.title}</h2>
                            <img src={image.url} className='photo_item' />
                        </>
                    }

                    <div className='items_half'>
                        {GOALS.map(el => (
                            <div className='item_card'>
                                <b>{el.title}</b>
                                <p>{el.category}</p>
                                {el.sources.map(source => <p>{source}</p>)}
                            </div>
                        ))}
                    </div>
                </>
            }
        </div>
    )
}

export default Images