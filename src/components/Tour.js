import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {ROLES, PHOTO_TYPES, ITEM_STATUSES} from '../constants/constants' 

const Tour = ({params}) => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [tour, setTour] = useState(null)
    const [profile, setProfile] = useState(null)
    const [personal, setPersonal] = useState(null)
    const [photo, setPhoto] = useState(null)
    const [item, setItem] = useState(null)
    const [isUsed, setIsUsed] = useState(false)
    const [likes, setLikes] = useState(0)
    const [daten, setDaten] = useState({
        role: ROLES[0],
        title: '',
        category: PHOTO_TYPES[0],
        cords: {lat: 0, long: 0},
        photo_url: ''
    })

    const {role, title, category, cords, photo_url} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const getTourM = gql`
        mutation getTour($name: String!, $shortid: String!) {
            getTour(name: $name, shortid: $shortid) {
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

    const getProfileM = gql`
        mutation getProfile($platform_id: String!) {
            getProfile(platform_id: $platform_id) {
                platform_id
                name
                items {
                    id
                    title
                    category
                    status
                    period
                    photo_url
                    rate
                }
            }
        }
    ` 

    const manageTourStatusM = gql`
        mutation manageTourStatus($name: String!, $id: String!, $option: String!, $role: String!, $item_id: String!, $title: String!, $category: String!, $status: String!) {
            manageTourStatus(name: $name, id: $id, option: $option, role: $role, item_id: $item_id, title: $title, category: $category, status: $status)
        }
    `

    const manageTourPhotoM = gql`
        mutation manageTourPhoto($name: String!, $id: String!, $option: String!, $title: String!, $category: String!, $cords: Cords!, $photo_url: String!, $collectionId: String!, $likes: Float!) {
            manageTourPhoto(name: $name, id: $id, option: $option, title: $title, category: $category, cords: $cords, photo_url: $photo_url, collectionId: $collectionId, likes: $likes)
        }
    `

    const useTourItemM = gql`
        mutation useTourItem($name: String!, $id: String!, $collectionId: String!) {
            useTourItem(name: $name, id: $id, collectionId: $collectionId)
        }
    `

    const [useTourItem] = useMutation(useTourItemM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.useTourItem !== undefined) {
                console.log(result.data.useTourItem)
                window.location.reload()
            }
        }
    }) 

    const [manageTourPhoto] = useMutation(manageTourPhotoM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageTourPhoto !== undefined) {
                console.log(result.data.manageTourPhoto)
                window.location.reload()
            }
        }
    }) 

    const [manageTourStatus] = useMutation(manageTourStatusM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageTourStatus !== undefined) {
                console.log(result.data.manageTourStatus)
                window.location.reload()
            }
        }
    }) 

    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getProfile !== undefined) {
                console.log(result.data.getProfile)
                setProfile(result.data.getProfile)
            }
        }
    })  

    const [getTour] = useMutation(getTourM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getTour !== undefined) {
                console.log(result.data.getTour)
                setTour(result.data.getTour)
            }
        }
    })  

    useEffect(() => {
        if (user !== null) {
            getTour({
                variables: {
                    name: user.name, shortid: params.id
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (user !== null && tour !== null) {
            let finden = tour.members.find(el => el.name === user.name)

            setView({...view, latitude: tour.cords.lat, longitude: tour.cords.long, zoom: 13})

            if (finden === undefined) {
                getProfile({
                    variables: {
                        platform_id: user.platform_id
                    }
                })
            } else {
                setPersonal(finden)
            }
        }
    }, [tour])

    useMemo(() => {
        if (user !== null && item !== null && personal === null) {
            setDaten({...daten, title: item.title, category: item.category})
        }
    }, [item])

    useMemo(() => {
        if (user !== null && item !== null && user.name !== item.name && personal !== null) {
            let finden = item.uses.find(el => el === user.name)

            setIsUsed(finden !== undefined)
        }
    }, [item])

    useMemo(() => {
        if (tour !== null && photo !== null) {
            setLikes(photo.likes)
        }
    }, [photo])

    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setDaten({...daten, photo_url: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const setCords = e => {
        setDaten({...daten, cords: {
            lat: e.lngLat[1],
            long: e.lngLat[0]
        }})
    }

    const onManageStatus = option => {
        manageTourStatus({
            variables: {
                name: user.name, id: params.id, option, role, item_id: option === 'join' ? item.id : personal.item_id, title, category, status: option === 'join' ? ITEM_STATUSES[1] : ITEM_STATUSES[0]
            }
        })
    }

    const onManagePhoto = option => {
        manageTourPhoto({
            variables: {
                name: user.name, id: params.id, option, title, category, cords, photo_url, collectionId: option === 'create' ? '' : photo.id, likes
            }
        })
    }

    const onUseItem = () => {
        useTourItem({
            variables: {
                name: user.name, id: params.id, collectionId: item.id
            }
        })
    }

    return (
        <div className='main'>
            {tour === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && tour !== null && profile !== null && personal === null && profile.items.length > 0 && 
                <>                        
                    <h1>Выберите роль, предмет и присоединяйтесь к туру</h1>
                    
                    <select value={role} onChange={e => setDaten({...daten, role: e.target.value})}>
                        {ROLES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <div className='items_half'>
                        {profile.items.filter(el => el.status === ITEM_STATUSES[0]).map(el => <b onClick={() => setItem(el)} className='item_card'>{el.title}</b>)}
                    </div>
                    <button onClick={() => onManageStatus('join')} className='btn'>Присоединиться</button>
                </>
            }
            {user !== null && tour !== null && personal !== null &&
                <>                        
                    <h1>Карта {tour.title} ({tour.distance} км)</h1>
                    <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        <Marker latitude={tour.cords.lat} longitude={tour.cords.long}>
                            <b>Старт</b>
                        </Marker>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <b>Фото</b>
                        </Marker>
                        {tour.coordinates.map(el => (
                            <Marker latitude={el.dot.lat} longitude={el.dot.long}>
                                <b>*</b>
                            </Marker>
                        ))}
                        {tour.photos.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => setPhoto(el)}>{el.title}</b>
                            </Marker>
                        ))}
                    </ReactMapGL>
                   
                    <h2>Добавьте фото на карту</h2>
                    <input value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Название фото' className='inp' />
                    <select value={category} onChange={e => setDaten({...daten, category: e.target.value})}>
                        {PHOTO_TYPES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <input onChange={onUpload} type='file' className='inp' />
                    <button onClick={() => onManagePhoto('create')} className='btn'>+</button>

                    {photo !== null && user.name === photo.name && <button onClick={() => onManagePhoto('delete')} className='btn'>Удалить</button>}

                    {photo !== null && user.name !== photo.name &&
                        <>
                            <h2>{photo.title}</h2>
                            <img src={photo.photo_url} className='photo_item' />
                            <b>{likes} лайков</b>   
                            <button onClick={() => setLikes(likes + 1)} className='btn'>+</button>
                            <button onClick={() => onManagePhoto('like')} className='btn'>Понравилось</button>
                        </>
                    }

                    <div className='items_half'>
                        <button onClick={() => onManageStatus('exit')} className='btn'>Выйти</button>
                        <button onClick={() => setLoc(`/chat/${tour.shortid}`)} className='btn'>Перейти в чат</button>
                    </div>
                  

                    <h2>Вещи тура</h2>
                    <div className='items_half'>
                        {tour.items.map(el => <b onClick={() => setItem(el)} className='item_card'>{el.title} (использовано {el.uses.length})</b>)}
                    </div>

                    {item !== null && user.name !== item.name && !isUsed && <button onClick={onUseItem} className='btn'>Буду использовать</button>}
                </>
            }
        </div>
    )
}

export default Tour