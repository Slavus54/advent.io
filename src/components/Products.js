import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {TOUR_ITEMS_TYPES, ROLES} from '../constants/constants'

const Products = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState(TOUR_ITEMS_TYPES[0])
    const [role, setRole] = useState(ROLES[0])
    const [user, setUser] = useState(null)
    const [products, setProducts] = useState(null)
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

    const getProductsM = gql`
        mutation getProducts($name: String!) {
            getProducts(name: $name) {
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

    const [getProducts] = useMutation(getProductsM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getProducts !== undefined) {
                console.log(result.data.getProducts)
                setProducts(result.data.getProducts)
                setFiltered(result.data.getProducts)
            }
        }
    })  

    useEffect(() => {
        if (user !== null) {
            getProducts({
                variables: {
                    name: user.name
                }
            })
        }
    }, [user])

    useMemo(() => {
        if (products !== null) {
            let result = products.filter(el => el.role === role && el.category === category)

            if (title !== '') {
                result = result.filter(el => el.title.toLowerCase().includes(title.toLowerCase()) && parseInt(el.title.length / 3) <= title.length)
            }

            setFiltered(result)
        }
    }, [products, title, category, role])

    return (
        <div className='main'>
            {products === null && <img src='https://img.icons8.com/ios-filled/50/iphone-spinner--v1.png' className='loader' />}
            {user !== null && products !== null &&
                <>                        
                    <h1>Подберите продукт для туров</h1>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Название продукта' className='inp' />
                    <div className='items_half'>
                        <div className='item'>
                            <h3>Тип</h3>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                {TOUR_ITEMS_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                        <div className='item'>
                            <h3>Роль в туре</h3>
                            <select value={role} onChange={e => setRole(e.target.value)}>
                                {ROLES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>                    
                    </div>
                    <div className='items_half'>
                        {filtered.map(el => <b onClick={() => setLoc(`/product/${el.shortid}`)} className='item_card'>{el.title}</b>)}
                    </div>
                </>
            }
        </div>
    )
}

export default Products