import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {PROFILE_MODULES, BASIC_PHOTO_URL, CONTACTS, ITEMS_PERIODS, ITEM_STATUSES, TOUR_ITEMS_TYPES, ACHIEVEMENT_DIRECTIONS, COLLETION_LIMIT, shorter} from '../constants/constants'

const Main = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [ach, setAch] = useState(null)
    const [item, setItem] = useState(null)
    const [contact, setContact] = useState(null)
    const [isPass, setIsPass] = useState(false)
    const [index, setIndex] = useState(0)
    const [module, setModule] = useState(PROFILE_MODULES[index])
    const [daten, setDaten] = useState({
        password: '',
        cords: {
            lat: 0,
            long: 0
        },
        personal_photo: '',
        designation: CONTACTS[0].designation,
        image: CONTACTS[0].image,
        url: '',
        title: '',
        category: TOUR_ITEMS_TYPES[0],
        status: ITEM_STATUSES[0],
        period: ITEMS_PERIODS[0],
        photo_url: '',
        rate: 50,
        label: '',
        direction: ACHIEVEMENT_DIRECTIONS[0],
        check_photo: '',
        placeholder: CONTACTS[0].placeholder
    })

    const {password, cords, personal_photo, designation, image, url, title, category, status, period, photo_url, rate, label, direction, check_photo, placeholder} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const getProfileM = gql`
        mutation getProfile($platform_id: String!) {
            getProfile(platform_id: $platform_id) {
                platform_id
                name
                password
                region
                cords {
                    lat
                    long
                }
                personal_photo
                domain
                distance
                items {
                    id
                    title
                    category
                    status
                    period
                    photo_url
                    rate
                }
                achievements {
                    id
                    label
                    direction
                    check_photo
                    likes
                }
                contacts {
                    designation
                    image
                    url
                }
                basic_collections {
                    id
                    title
                    route_type
                    role
                }
            }
        }
    ` 

    const secureProfileM = gql`
        mutation secureProfile($name: String!, $platform_id: String!, $password: String!) {
            secureProfile(name: $name, platform_id: $platform_id, password: $password)
        }
    `

    const updateProfileM = gql`
        mutation updateProfile($platform_id: String!, $cords: Cords!, $personal_photo: String!)  {
            updateProfile(platform_id: $platform_id, cords: $cords, personal_photo: $personal_photo) 
        }
    `

    const manageProfileContactM = gql`
        mutation manageProfileContact($platform_id: String!, $option: String!, $designation: String!, $image: String!, $url: String!) {
            manageProfileContact(platform_id: $platform_id, option: $option, designation: $designation, image: $image, url: $url) 
        }
    `

    const manageProfileItemM = gql`
        mutation manageProfileItem($platform_id: String!, $option: String!, $title: String!, $category: String!, $status: String!, $period: String!, $photo_url: String!, $rate: Float!, $collectionId: String!) {
            manageProfileItem(platform_id: $platform_id, option: $option, title: $title, category: $category, status: $status, period: $period, photo_url: $photo_url, rate: $rate, collectionId: $collectionId)
        }
    `

    const manageProfileAchievementM = gql`
        mutation manageProfileAchievement($platform_id: String!, $option: String!, $label: String!, $direction: String!, $check_photo: String!, $collectionId: String!, $likes: Float!) {
            manageProfileAchievement(platform_id: $platform_id, option: $option, label: $label, direction: $direction, check_photo: $check_photo, collectionId: $collectionId, likes: $likes) 
        }
    `

    const [manageProfileAchievement] = useMutation(manageProfileAchievementM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageProfileAchievement !== undefined) {
                console.log(result.data.manageProfileAchievement)
                window.location.reload()
            }
        }
    })

    const [manageProfileItem] = useMutation(manageProfileItemM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageProfileItem !== undefined) {
                console.log(result.data.manageProfileItem)
                window.location.reload()
            }
        }
    })

    const [manageProfileContact] = useMutation(manageProfileContactM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageProfileContact !== undefined) {
                console.log(result.data.manageProfileContact)
                window.location.reload()
            }
        }
    })

    const [updateProfile] = useMutation(updateProfileM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.updateProfile !== undefined) {
                console.log(result.data.updateProfile)
                window.location.reload()
            }
        }
    })

    const [secureProfile] = useMutation(secureProfileM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.secureProfile !== undefined) {
                console.log(result.data.secureProfile)
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

    useEffect(() => {
        if (user !== null) {
            getProfile({
                variables: {
                    platform_id: user.platform_id
                }
            })
        }
    }, [user])

    useEffect(() => {
        if (profile !== null) {
            setView({...view, latitude: profile.cords.lat, longitude: profile.cords.long, zoom: 16})
            setDaten({...daten, personal_photo: profile.personal_photo, cords: {lat: profile.cords.lat, long: profile.cords.long}})
        }
    }, [profile])

    useMemo(() => {
        if (profile !== null) {
           setModule(PROFILE_MODULES[index])
        }
    }, [index])

    useMemo(() => {
        if (profile !== null && designation !== '') {
            let finden = profile.contacts.find(el => el.designation === designation)

            if (finden !== undefined) {
                setContact(finden)
            } else {
                setContact(null)
            }
        }
    }, [designation])

    useMemo(() => {
        if (profile !== null && item !== null) {
            setDaten({...daten, status: item.status, period: item.period, rate: item.rate, photo_url: item.photo_url})
        }
    }, [item])

    const onUpload = (e, key) => {
        let reader = new FileReader()

        reader.onload = ev => {
            if (key === 'personal') {
                setDaten({...daten, personal_photo: ev.target.result})
            } else if (key === 'item') {
                setDaten({...daten, photo_url: ev.target.result})
            } else if (key === 'achievement') {
                setDaten({...daten, check_photo: ev.target.result})
            }
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const setCords = e => {
        setDaten({...daten, cords: {
            lat: e.lngLat[1],
            long: e.lngLat[0]
        }})
    }
    
    const onCopy = () => {
        window.navigator.clipboard.writeText( profile.platform_id)
    }

    const onLogOut = () => {
        let inst = new CookieWorker('profile')

        inst.delete()

        setLoc('/login')
        window.location.reload()
    }

    const onSetMedia = idx => {
        let item = CONTACTS[idx]

        setDaten({...daten, designation: item.designation, image: item.image, placeholder: item.placeholder})
    }

    const onSecure = () => {
        if (!isPass && profile.password === password) {
            setIsPass(true)
        } else if (isPass) {
            secureProfile({
                variables: {
                    name: profile.name, platform_id: profile.platform_id, password
                }
            })
        }
    }

    const onUpd = () => {
        updateProfile({
            variables: {
                platform_id: profile.platform_id, cords, personal_photo
            }
        })
    }
  
    const onManageContact = option => {
        manageProfileContact({
            variables: {
                platform_id: profile.platform_id, option, designation, image, url
            }
        })
    }

    const onManageAchievement = option => {
        manageProfileAchievement({
            variables: {
                platform_id: profile.platform_id, option, label, direction, check_photo, collectionId: option === 'create' ? '' : ach.id, likes: 0
            }
        })
    }

    const onManageItem = option => {
        manageProfileItem({
            variables: {
                platform_id: profile.platform_id, option, title, category, status, period, photo_url, rate, collectionId: option === 'create' ? '' : item.id
            }
        })
    }

    return (
        <div className='main'>
            {user !== null && profile === null && user.platform_id !== '' && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && profile !== null &&
                <>                        
                    <div className='main'>
                        <img src={personal_photo === '' ? BASIC_PHOTO_URL : personal_photo} className='photo_item' />
                        <h2>{profile.name}</h2>
                        <h3>Пройдено {profile.distance} км</h3>
                        <button onClick={onCopy} className='btn'>ID</button>
                        <button onClick={onLogOut} className='btn'>Выйти</button>  
                    </div>
                    
                    <h2>Доступные коллекции</h2>
                    <div className='items_half'>
                        <b onClick={() => setLoc(`/create-tour/${profile.platform_id}`)} className='item_card'>Тур</b> 
                        <b onClick={() => setLoc(`/create-product/${profile.platform_id}`)} className='item_card'>Продукт</b> 
                        {user.domain === 'ua' && <b onClick={() => setLoc(`/create-image/${profile.platform_id}`)} className='item_card'>Фото</b> }
                    </div>                                      
                    
                    <h2>{module.title}</h2>
                    <div className='items_half'>
                        <img onClick={() => index > 0 && setIndex(index - 1)} src={index > 0 ? PROFILE_MODULES[index - 1].url : PROFILE_MODULES[0].url} className='icon' />
                        <img onClick={() => index < PROFILE_MODULES.length - 1 && setIndex(index + 1)} src={index < PROFILE_MODULES.length - 1 ? PROFILE_MODULES[index + 1].url : PROFILE_MODULES[index].url} className='icon' />
                    </div>
                   
                    {module.title === 'Персональные данные' &&
                        <div className='module_container'>
                            <h3>Ваше расположение</h3>
                            <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                                <Marker latitude={profile.cords.lat} longitude={profile.cords.long}>
                                    <b>*</b>
                                </Marker>
                                <Marker latitude={cords.lat} longitude={cords.long}>
                                    <b>{profile.name}</b>
                                </Marker>
                            </ReactMapGL>

                            <h3>Загрузите фото</h3>
                            <input onChange={e => onUpload(e, 'personal')} type='file' className='inp' />

                            <button onClick={onUpd} className='btn'>Обновить</button>
                        </div>
                    }

                    {module.title === 'Безопасность' &&
                        <div className='module_container'>
                            <h3>{isPass ? 'Введите новый' : 'Обновите свой'} пароль</h3>
                            <input value={password} onChange={e => setDaten({...daten, password: e.target.value})} placeholder={`${isPass ? 'Введите новый' : 'Введите текущий'} пароль`} className='inp' />
                            <button onClick={onSecure} className='btn'>{isPass ? 'Обновить' : 'Подтвердить'}</button>
                        </div>
                    }

                    {module.title === 'Предметы' &&
                        <div className='module_container'>
                            {item === null ?
                                   <>
                                        <h2>Добавьте предмет в рюкзак ({profile.items.length}/{COLLETION_LIMIT})</h2>
                                        <input value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Название предмета' className='inp' />
                                        <select value={category} onChange={e => setDaten({...daten, category: e.target.value})}>
                                            {TOUR_ITEMS_TYPES.map(el => <option value={el}>{el}</option>)}
                                        </select>
                                        <input onChange={e => onUpload(e, 'item')} type='file' className='inp' />
                                        <button onClick={() => onManageItem('create')} className='btn'>+</button> 
                                        <div className='items_half'>
                                            {profile.items.map(el => <b onClick={() => setItem(el)} className='item_card'>{el.title}</b>)}
                                        </div>
                                    </>
                                :
                                    <>
                                        <h2>{item.title}</h2>
                                        <img src={item.photo_url} className='icon' />
                                        <div className='items_half'>
                                            <div className='item'>
                                                <h3>Время владения</h3>
                                                <select value={period} onChange={e => setDaten({...daten, period: e.target.value})}>
                                                    {ITEMS_PERIODS.map(el => <option value={el}>{el}</option>)}
                                                </select>
                                            </div>
                                            <div className='item'>
                                                <h3>Статус</h3>
                                                <select value={status} onChange={e => setDaten({...daten, status: e.target.value})}>
                                                    {ITEM_STATUSES.map(el => <option value={el}>{el}</option>)}
                                                </select>
                                            </div>                                            
                                        </div>
                                        <input onChange={e => onUpload(e, 'item')} type='file' className='inp' />
                                        {status !== 'В корзине' && 
                                            <>
                                                <h3>Рейтинг: {rate}/100</h3>
                                                <input value={rate} onChange={e => setDaten({...daten, rate: parseInt(e.target.value)})} type='range' step={5} className='inp' />
                                            </>
                                        }
                                        <div className='items'>
                                            <button onClick={() => onManageItem('delete')} className='btn'>Удалить</button>
                                            <button onClick={() => onManageItem('update')} className='btn'>Обновить</button>
                                        </div>
                                        <button onClick={() => setItem(null)} className='btn'>К предметам</button>
                                    </>
                            }
                        </div>
                    }

                    {module.title === 'Достижения' &&
                        <>
                            {ach === null ? 
                                    <div className='module_container'>
                                        <h2>Добавьте достижение</h2>
                                        <textarea value={label} onChange={e => setDaten({...daten, label: e.target.value})} placeholder='Опишите это...' className='inp' />
                                        <select value={direction} onChange={e => setDaten({...daten, direction: e.target.value})}>
                                            {ACHIEVEMENT_DIRECTIONS.map(el => <option value={el}>{el}</option>)}
                                        </select>
                                        <input onChange={e => onUpload(e, 'achievement')} type='file' className='inp' />
                                        <button onClick={() => onManageAchievement('create')} className='btn'>+</button>
                                        <div className='items_half'>
                                            {profile.achievements.map(el => <b onClick={() => setAch(el)} className='item_card'>{shorter(el.label)}</b>)}
                                        </div>
                                    </div>
                                 
                                :
                                    <div className='module_container'>
                                        <h2>{ach.label}</h2>
                                        <b>{ach.likes} лайков</b>
                                        <button onClick={() => onManageAchievement('delete')} className='btn'>Удалить</button>
                                    </div>
                            }
                        </>
                    }

                    {module.title === 'Контакты' &&
                        <div className='module_container'>
                            <h3>Добавьте медиа</h3>
                            <img src={image} className='icon' />
                            <select onChange={e => onSetMedia(e.target.value)}>
                                {CONTACTS.map((el, idx) => <option value={idx}>{el.designation}</option>)}
                            </select>

                            {contact !== null ?
                                    <button onClick={() => onManageContact('delete')} className='btn'>Удалить {contact.designation}</button>
                                :
                                    <>
                                        <input value={url} onChange={e => setDaten({...daten, url: e.target.value})} placeholder={placeholder} className='inp' />
                                        <button onClick={() => onManageContact('create')} className='btn'>+</button>
                                    </>
                            }
                        </div>
                    }

                    {module.title === 'Коллекции' &&
                        <div className='module_container'>
                            <h3>Мои коллекции</h3>
                            <div className='items_half'>
                                {profile.basic_collections.map(el => <b onClick={() => setLoc(`/${el.route_type}/${el.id}`)} className='item_card'>{el.route_type}: {el.title}</b>)}
                            </div>
                        </div>
                    }           
                </>
            }
            {user === null && profile === null && <button onClick={() => setLoc(`/register`)} className='btn'>Создать Профиль</button>}
        </div>
    )
}

export default Main 