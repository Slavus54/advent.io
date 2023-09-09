// register

export const REGIONS = [
    {
        title: 'Харьков',
        domain: 'ua',
        cords: {
            lat: 49.989,
            long: 36.235
        }
    },
    {
        title: 'Санкт-Петербург',
        domain: 'ru',
        cords: {
            lat: 59.94,
            long: 30.338
        }
    },
    {
        title: 'Киев',
        domain: 'ua',
        cords: {
            lat: 50.45,
            long: 30.522
        }
    },
    {
        title: 'Москва',
        domain: 'ru',
        cords: {
            lat: 55.755,
            long: 37.625
        }
    },
    {
        title: 'Гродно',
        domain: 'by',
        cords: {
            lat: 53.678,
            long: 23.83
        }
    }
]

export const REGISTER_STAGES = ['Место', 'Фото профиля']

// login

export const METHODS = ['ID', 'Password']
export const BASIC_PHOTO_URL = 'https://www.russianglobal.com/custom/domain_2/image_files/sitemgr_photo_6811.png'

// main
 
export const PROFILE_MODULES = [
    {
        title: 'Персональные данные',
        url: 'https://img.icons8.com/ios/50/information--v1.png'
    },
    {
        title: 'Безопасность',
        url: 'https://img.icons8.com/ios/50/private2.png'
    },
    {
        title: 'Контакты',
        url: 'https://img.icons8.com/ios/50/communication--v1.png'
    },
    {
        title: 'Предметы',
        url: 'https://img.icons8.com/ios/50/holding-box.png'
    },
    {
        title: 'Достижения',
        url: 'https://img.icons8.com/ios-filled/50/medal2.png'
    },
    {
        title: 'Коллекции',
        url: 'https://img.icons8.com/ios/50/list--v1.png'
    }
]

export const ITEMS_PERIODS = ['Пару месяцев', 'Почти год']
export const ITEM_STATUSES = ['Готов', 'Задействован', 'В корзине']
export const ACHIEVEMENT_DIRECTIONS = ['Строительтво', 'Транспорт', 'IT']

// tour && product

export const TOUR_TYPES = ['Поле', 'Лес', 'Холмы']
export const COORDINATE_FORMATS = ['Пробежка', 'Спуск', 'Подъём', 'Запечатление']
export const SURFACES = ['Земля', 'Песок', 'Асфальт']
export const TOUR_ITEMS_TYPES = ['Инструмент', 'Ориентирование', 'Приготовление пищи', 'Жильё']
export const PHOTO_TYPES = ['Селфи' ,'Панорама']
export const ROLES = ['Добытчик', 'Инженер', 'Проводник']

// image

export const DAMAGE_TYPES = ['Бомбардировка', 'Артиллерийский огонь', 'Растрел']

export const GOALS = [
    {
        title: 'Masterkladki',
        category: 'Строительство',
        sources: ['ПриватБанк 4731219644926135', 'Monobank 5375414143271780']
    }
]

// system

export const WATCH_BORDERS = [24, 60]
export const TIME_BORDERS = [420, 1430]
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const CHAT_VARIANTS = ['текст', 'фото']
export const LEVELS = ['легко', 'средне', 'сложно', 'невозможно']
export const GENDERS = ['мужской', 'женский']
export const CHAT_LIMIT = 100
export const COLLETION_LIMIT = 10

export const CONTACTS = [
    {
        designation: 'Telegram',
        image: 'https://img.icons8.com/color/48/telegram-app--v1.png',
        placeholder: 'Тег канала'
    },
    {
        designation: 'WhatsApp',
        image: 'https://img.icons8.com/color/48/whatsapp--v1.png',
        placeholder: 'Номер телефона'
    },
    {
        designation: 'VK',
        image: 'https://img.icons8.com/color/48/vk-com.png',
        placeholder: 'Ссылка на страницу'
    }
]

export const ROUTES = [
    {
        title: 'Профиль',
        log_flag: '+',
        url: '/'
    },
    {
        title: 'Вход',
        log_flag: '-',
        url: '/login'
    },
    {
        title: 'Новый профиль',
        log_flag: '-',
        url: '/register'
    },
    {
        title: 'Туры',
        log_flag: '+',
        url: '/tours'
    },
    {
        title: 'Продукты',
        log_flag: '+',
        url: '/products'
    },
    {
        title: 'Ukraine',
        log_flag: '+',
        url: '/images'
    },
    {
        title: 'Пользователи',
        log_flag: '+',
        url: '/profiles'
    }
]

export const MAP_WALKING = [
    {
        url: 'https://img.icons8.com/ios/50/left--v1.png',
        lat: '',
        long: '-'
    },
    {
        url: 'https://img.icons8.com/ios/50/up--v1.png',
        lat: '+',
        long: ''
    },
    {
        url: 'https://img.icons8.com/ios/50/right--v1.png',
        lat: '',
        long: '+'
    },
    {
        url: 'https://img.icons8.com/ios/50/down--v1.png',
        lat: '-',
        long: ''
    }
]

// basic functions

export function haversine(lat1, long1, lat2, long2) {
    let r = 6371

    let latDiff = Math.PI * (lat2 - lat1) / 180
    let longDiff = Math.PI * (long2 - long1) / 180

    let sin = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(Math.PI * lat1 / 180) * Math.cos(Math.PI * lat2 / 180) * Math.sin(longDiff / 2) * Math.sin(longDiff / 2)
    let a = 2 * Math.atan2(Math.sqrt(sin), Math.sqrt(1 - sin))

    return a * r
}

export const num_formatted = num => {
    return num < 10 ? `0${num}` : num
}

export const convert = t => {
    return `${num_formatted(parseInt(t / 60))}:${num_formatted(parseInt(t % 60))}`
}

export const deconvert = t => {
    return parseInt(t.split(':')[0] * 60) + parseInt(t.split(':')[1])
}

export const shorter = (str, border = 5) => {
    let length = typeof str === 'string' ? str.split(' ').length : -1

    return length === -1 ? '' : str.split(' ').slice(0, border > length ? length : border).join(' ') + '...'
}

export const card_validator = (content, type) => {
    if (type === 'convert') {

        let result = ''

        content.split('').map((el, idx) => {
            if ((idx + 1) % 4 === 0) {
                result += `${el}-`
            } else {
                result += el
            }
        })
        
        return result.slice(0, 19)

    } else if (type === 'deconvert') {
        return content.split('-').join('')
    }   
}

export const chat_render = (name, interlocutor, variant, text, selector = 'chat_icon') => {
    if (variant === 'текст') {
        return <><b>{name} {interlocutor !== '' && `говорит ${interlocutor}`}</b><p>{text}</p></>
    } else if (variant === 'фото') {
        return <><b>{name} отправил фото</b><img src={text} className={selector} /></>
    }
}