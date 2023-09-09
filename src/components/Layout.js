import React, {useState, useEffect, useMemo, useContext} from 'react';
import {Route, Link, useLocation} from 'wouter'
import {CookieWorker} from '../libs/CookieWorker'
import {ROUTES} from '../constants/constants'
import Main from './Main'
import Register from './Register'
import Login from './Login'
import CreateTour from './CreateTour'
import Tours from './Tours'
import Tour from './Tour'
import CreateProduct from './CreateProduct'
import Products from './Products'
import Product from './Product'
import CreateImage from './CreateImage'
import Images from './Images'
import Profiles from './Profiles'
import Profile from './Profile'

const Layout = ({children}) => {
    const [loc, setLoc] = useLocation()
    const [view, setView] = useState({
        latitude: 55,
        longitude: 81,
        width: '500px',
        height: '300px',
        zoom: 3
    })
    const [user, setUser] = useState(null)

    useMemo(() => {
        let inst = new CookieWorker('profile')

        let data = inst.gain()

        if (data === null) {
            inst.save(data, 12)
        }

        setUser(inst.gain())
    }, [])

    const onFilterRoutes = () => {
        let filtered = ROUTES

        if (user === null) {
            filtered = filtered.filter(el => el.log_flag !== '+')
        } else {
            filtered = filtered.filter(el => el.log_flag !== '-')
        }

        return filtered
    }
 
    return (
        <>
            <div className='navbar'>
                {onFilterRoutes().map(el => 
                    <Link key={el.title} href={el.url}>
                        <div className='nav_item'>{el.title}</div> 
                    </Link>
                )}                    
            </div>
            
            {children}

            <Route component={Main} path='/' />
            <Route component={Register} path='/register' />
            <Route component={Login} path='/login' />
            <Route component={CreateTour} path='/create-tour/:id' />
            <Route component={Tours} path='/tours' />
            <Route component={Tour} path='/tour/:id' />
            <Route component={CreateProduct} path='/create-product/:id' />
            <Route component={Products} path='/products' />
            <Route component={Product} path='/product/:id' />
            <Route component={CreateImage} path='/create-image/:id' />
            <Route component={Images} path='/images' />
            <Route component={Profiles} path='/profiles' />
            <Route component={Profile} path='/profile/:id/:item_id' />
        </>
    )
}

export default Layout