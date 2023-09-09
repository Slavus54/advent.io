import React, {useState, useEffect, useMemo} from 'react';
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {CookieWorker} from '../libs/CookieWorker'
import {METHODS} from '../constants/constants'

const Login = () => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 50.499,
        longitude: 30.6,
        width: '500px',
        height: '300px',
        zoom: 7
    })
    const [user, setUser] = useState(null)
    const [method, setMethod] = useState(METHODS[0])
    const [daten, setDaten] = useState({
        name: '',
        password: '',
        platform_id: ''
    })

    const {name, password, platform_id} = daten

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const loginM = gql`
        mutation login($method: String!, $name: String!, $password: String!, $platform_id: String!)  {
            login(method: $method, name: $name, password: $password, platform_id: $platform_id) {
                platform_id
                name
                domain
            }
        }
    `

    const [login] = useMutation(loginM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.login !== undefined) {
                console.log(result.data.login)

                let inst = new CookieWorker('profile')

                inst.save(result.data.login, 48)
            
                setLoc('/')
                window.location.reload()
            }
        }
    })

    const onFocusID = () => {
        window.navigator.clipboard.readText().then(data => typeof data === 'string' && setDaten({...daten, platform_id: data}))
    }

    const onLogin = () => {
        login({
			variables: {
				method, name, password, platform_id
			}
		})
	}

    return (
        <div className='main'>
            {user === null &&
                <>
                    <h1>Войти в профиль</h1>
                    <select value={method} onChange={e => setMethod(e.target.value)}>
                        {METHODS.map(el => <option value={el}>{el}</option>)}
                    </select>

                    {method === 'Password' ?
                            <>
                                <input value={name} onChange={e => setDaten({...daten, name: e.target.value})} placeholder='Ваше имя' className='inp' />
                                <input value={password} onChange={e => setDaten({...daten, password: e.target.value})} placeholder='Ваш пароль' className='inp' />
                            </>
                        :
                            <input onFocus={onFocusID} value={platform_id} onChange={e => setDaten({...daten, platform_id: e.target.value})} placeholder='Ваш ID' className='inp' />
                    }

                    <button onClick={onLogin} className='btn'>Войти</button>
                </>
            }
        </div>
    )
}

export default Login