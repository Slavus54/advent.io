import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {TOUR_ITEMS_TYPES, ROLES} from '../constants/constants'

const CreateProduct = ({params}) => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 11
    })
    const [user, setUser] = useState(null)
    const [daten, setDaten] = useState({
        title: '',
        category: TOUR_ITEMS_TYPES[0],
        role: ROLES[0],
        cost: '',
        main_photo: ''
    })

    const {title, category, role, cost, main_photo} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const createProductM = gql`
        mutation createProduct($name: String!, $id: String!, $title: String!, $category: String!, $role: String!, $cost: Float!, $main_photo: String!) {
            createProduct(name: $name, id: $id, title: $title, category: $category, role: $role, cost: $cost, main_photo: $main_photo)
        }
    `

    const [createProduct] = useMutation(createProductM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.createProduct !== undefined) {
                console.log(result.data.createProduct)

                setLoc('/')
                window.location.reload()
            }
        }
    })

    useMemo(() => {
        if (cost > 100) {
            let piece = cost % 10

            setDaten({...daten, cost: piece > 4 ? parseInt((cost / 10) + 1) * 10 : parseInt(cost / 10) * 10})
        }
       
    }, [cost])

    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setDaten({...daten, main_photo: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const onCreate = () => {
        createProduct({
            variables: {
                name: user.name, id: params.id, title, category, role, cost, main_photo
            }
        })
	}  
    
    return (
        <div className='main'>
            {user !== null &&
                <>
                    <h1>Создайте продукт</h1>
                    <input value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Название продукт' className='inp' />

                    <div className='items_half'>
                        <div className='item'>
                            <h3>Категория</h3>
                            <select value={category} onChange={e => setDaten({...daten, category: e.target.value})}>
                                {TOUR_ITEMS_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                    
                        <div className='item'>
                            <h3>Роль в туре</h3>
                            <select value={role} onChange={e => setDaten({...daten, role: e.target.value})}>
                                {ROLES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                    </div>

                    <input onChange={onUpload} type='file' className='inp' />

                    <input value={cost} onChange={e => setDaten({...daten, cost: parseInt(e.target.value)})} placeholder='Стоимость продукта' className='inp' />
                    {isNaN(cost) && <button onClick={() => setDaten({...daten, cost: ''})} className='btn'>Сбросить</button>}
                  

                    <button onClick={onCreate} className='btn'>Создать</button>
                </>
            }
        </div>
    )
}

export default CreateProduct