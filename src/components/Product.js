import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {TOUR_ITEMS_TYPES, ROLES, ITEM_STATUSES} from '../constants/constants'

const Product = ({params}) => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [product, setProduct] = useState(null)
    const [offer, setOffer] = useState(null)
    const [isUseVote, setIsUseVote] = useState(false)
    const [likes, setLikes] = useState(0)
    const [daten, setDaten] = useState({
        marketplace: '',
        cost: '',
        photo_url: '',
        cords: {lat: 0, long: 0},
        text: '',
        percent: 50
    })

    const {marketplace, cost, photo_url, cords, text, percent} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const getProductM = gql`
        mutation getProduct($name: String!, $shortid: String!) {
            getProduct(name: $name, shortid: $shortid) {
                shortid
                creator
                title
                category
                role
                cost
                main_photo
                percent
                voters
                offers {
                    id
                    name
                    marketplace
                    cost
                    photo_url
                    cords {
                        lat
                        long
                    }
                    likes
                }
                reviews {
                    id
                    name
                    text
                }
            }
        }
    ` 

    const manageProductOfferM = gql`
        mutation manageProductOffer($name: String!, $id: String!, $option: String!, $marketplace: String!, $cost: Float!, $photo_url: String!, $cords: Cords!, $collectionId: String!, $likes: Float!) {
            manageProductOffer(name: $name, id: $id, option: $option, marketplace: $marketplace, cost: $cost, photo_url: $photo_url, cords: $cords, collectionId: $collectionId, likes: $likes) 
        }
    `

    const makeProductReviewM = gql`
        mutation makeProductReview($name: String!, $id: String!, $text: String!, $status: String!) {
            makeProductReview(name: $name, id: $id, text: $text, status: $status) 
        }
    `

    const updateProductInfoM = gql`
        mutation updateProductInfo($name: String!, $id: String!, $cost: Float!, $main_photo: String!) {
            updateProductInfo(name: $name, id: $id, cost: $cost, main_photo: $main_photo) 
        }
    `

    const updateProductUsePercentM = gql`
        mutation updateProductUsePercent($name: String!, $id: String!, $percent: Float!) {
            updateProductUsePercent(name: $name, id: $id, percent: $percent) 
        }
    `

    const [updateProductUsePercent] = useMutation(updateProductUsePercentM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.updateProductUsePercent !== undefined) {
                console.log(result.data.updateProductUsePercent)
                window.location.reload()
            }
        }
    })  

    const [updateProductInfo] = useMutation(updateProductInfoM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.updateProductInfo !== undefined) {
                console.log(result.data.updateProductInfo)
                window.location.reload()
            }
        }
    })  

    const [makeProductReview] = useMutation(makeProductReviewM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.makeProductReview !== undefined) {
                console.log(result.data.makeProductReview)
                window.location.reload()
            }
        }
    })  

    const [manageProductOffer] = useMutation(manageProductOfferM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageProductOffer !== undefined) {
                console.log(result.data.manageProductOffer)
                window.location.reload()
            }
        }
    })  

    const [getProduct] = useMutation(getProductM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getProduct !== undefined) {
                console.log(result.data.getProduct)
                setProduct(result.data.getProduct)
            }
        }
    })  

    useEffect(() => {
        if (user !== null) {
            getProduct({
                variables: {
                    name: user.name, shortid: params.id
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (user !== null && product !== null) {
            let finden = product.voters.find(el => el === user.name)

            setIsUseVote(finden === undefined)
        }
    }, [product])

    useMemo(() => {
        if (cost > 100) {
            let piece = cost % 10

            setDaten({...daten, cost: piece > 4 ? parseInt((cost / 10) + 1) * 10 : parseInt(cost / 10) * 10})
        }
       
    }, [cost])

    useMemo(() => {
        if (offer !== null) {
            setLikes(offer.likes)
        }
       
    }, [offer])

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

    const onManageOffer = option => {
        manageProductOffer({
            variables: {
                name: user.name, id: params.id, option, marketplace, cost, photo_url, cords, collectionId: option === 'create' ? '' : offer.id, likes
            }
        })
    }

    const onUpdateUsePercent = () => {
        updateProductUsePercent({
            variables: {
                name: user.name, id: params.id, percent: parseInt(percent)
            }
        })
    }

    const onUpdateInfo = () => {
        updateProductInfo({
            variables: {
                name: user.name, id: params.id, cost: offer.cost, main_photo: offer.photo_url
            }
        })
    }

    const onMakeReview = () => {
        makeProductReview({
            variables: {
                name: user.name, id: params.id, text, status: ITEM_STATUSES[ITEM_STATUSES.length - 1]
            }
        })
    }

    return (
        <div className='main'>
            {product === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && product !== null &&
                <>                        
                    <h1>{product.title}</h1>

                    {isUseVote && 
                        <>
                            <h2>Шанс, с которым возмёшь это в в тур ({percent}%)</h2>
                            <input value={percent} onChange={e => setDaten({...daten, percent: e.target.value})} type='range' step={5} className='inp' />
                            <button onClick={onUpdateUsePercent} className='btn'>Ответить</button>
                        </>
                    }

                    <h2>Оставьте в отзыв</h2>
                    <textarea value={text} onChange={e => setDaten({...daten, text: e.target.value})} placeholder='Ваши впечатления' className='inp' />
                    <button onClick={onMakeReview} className='btn'>Добавить в рюкзак</button>

                    <h2>Создайте предложение</h2>
                    <input value={marketplace} onChange={e => setDaten({...daten, marketplace: e.target.value})} placeholder='Название магазина' className='inp' />
                    <input value={cost} onChange={e => setDaten({...daten, cost: parseInt(e.target.value)})} placeholder='Стоимость продукта' className='inp' />
                    {isNaN(cost) && <button onClick={() => setDaten({...daten, cost: ''})} className='btn'>Сбросить</button>}
                    <input onChange={onUpload} type='file' className='inp' />
                    <button onClick={() => onManageOffer('create')} className='btn'>Создать</button>
                    <ReactMapGL {...view} onClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} className='map'>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <b>*</b>
                        </Marker>
                        {product.offers.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => setOffer(el)}>{el.marketplace}</b>
                            </Marker>
                        ))}
                    </ReactMapGL>

                    {offer !== null && user.name === offer.name && <button onClick={() => onManageOffer('delete')} className='btn'>Удалить</button>}
                    {offer !== null && user.name !== offer.name && 
                        <>
                            <h2>{offer.marketplace} по цене {offer.cost}</h2>
                            <img src={offer.photo_url} className='photo_item' />
                            <button onClick={onUpdateInfo} className='btn'>Сделать основным</button>
                            <h3>{likes} лайков</h3>
                            <button onClick={() => setLikes(likes + 1)} className='btn'>+</button>
                            <button onClick={() => onManageOffer('like')} className='btn'>Понравилось</button>
                        </>
                    }
                </>
            }
        </div>
    )
}

export default Product