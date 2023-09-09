import {createContext, useState} from 'react'
import {THEMES} from '../constants/constants'

const initialState = {
    current_theme: localStorage.getItem('theme') === null ? THEMES[0] : JSON.parse(localStorage.getItem('theme'))
}

export const MyContext = createContext(initialState)

export const MyProvider = ({children}) => {
    const [state, setState] = useState(initialState)
    const {current_theme} = state

    const set_theme = (title, selectors = []) => {
        let finden = THEMES.find(el => el.title === title)

        selectors.map(el => {
            el.style.backgroundColor = finden.back
            el.style.color = finden.text
        })    

        setState({...setState, current_theme: finden})
        localStorage.setItem('theme', JSON.stringify(finden))
    }

    const check_theme = selectors => {
        
        selectors.map(el => {
            el.style.backgroundColor = current_theme.back
            el.style.color = current_theme.text
        })    
    }

    return <MyContext.Provider value={{current_theme, set_theme, check_theme}}>{children}</MyContext.Provider>
}