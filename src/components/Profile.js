import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {BASIC_PHOTO_URL} from '../constants/constants'

const Profile = ({params}) => {
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
    const [likes, setLikes] = useState(0)

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
                    platform_id: params.id
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (profile !== null) {
            if (params.item_id !== 'none') {
                let finden = profile.items.find(el => el.id === params.item_id)

                if (finden !== undefined) {
                    setItem(finden)
                }
            }
        }
    }, [profile])

    useMemo(() => {
        if (ach !== null) {
            setLikes(ach.likes)
        }
    }, [ach])

    const onManageAchievement = option => {
        manageProfileAchievement({
            variables: {
                platform_id: profile.platform_id, option, label: '', direction: '', check_photo: '', collectionId: ach.id, likes
            }
        })
    }

    return (
        <div className='main'>
            {profile === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && profile !== null && user.platform_id !== profile.platform_id && 
                <>                        
                    <div className='main'>
                        <img src={profile.personal_photo === '' ? BASIC_PHOTO_URL : profile.personal_photo} className='photo_item' />
                        <h2>{profile.name}</h2>
                        <h3>Пройдено {profile.distance} км</h3>
                    </div>
                          
                    {item !== null &&
                        <div className='main form'>
                            <h3>Отзыв на {item.title}</h3>
                            <b>Время владения: {item.period}</b>
                            <b>Рейтинг: {item.rate}%</b>
                        </div>
                    }

                    <h2>Достижения</h2>
                    <div className='items_half'>
                        {profile.achievements.map(el => <b onClick={() => setAch(el)} className='item_card'>{shorter(el.label)}</b>)}
                    </div>

                    {ach !== null &&
                        <>
                            <h2>{ach.label}</h2>
                            <b>{likes} лайков</b>
                            <button onClick={() => setLikes(likes)} className='btn'>+</button>
                            <button onClick={() => onManageAchievement('like')} className='btn'>Понравилось</button>
                        </>
                    }
                </>
            }
        </div>
    )
}

export default Profile