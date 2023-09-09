const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const months = [
    {
        title: 'Jan',
        value: 31
    },
    {
        title: 'Feb',
        value: 29
    },
    {
        title: 'Mar',
        value: 31
    },
    {
        title: 'Apr',
        value: 30
    },
    {
        title: 'May',
        value: 31
    },
    {
        title: 'Jun',
        value: 30
    },
    {
        title: 'Jul',
        value: 31
    },
    {
        title: 'Aug',
        value: 31
    },
    {
        title: 'Sep',
        value: 30
    },
    {
        title: 'Oct',
        value: 31
    },
    {
        title: 'Nov',
        value: 30
    },
    {
        title: 'Dec',
        value: 31
    }
]

const day_value = 1000 * 3600 * 24

const periods = [
    {
        title: 'завтра',
        change: '+',
        isChangeUsed: true,
        value: 1
    },
    {
        title: 'на неделе',
        change: '+',
        isChangeUsed: true,
        value: 7
    },
    {
        title: 'вчераа',
        change: '-',
        isChangeUsed: true,
        value: 1
    },
    {
        title: 'день',
        change: '',
        isChangeUsed: false,
        value: 1
    },
    {
        title: 'неделя',
        change: '',
        isChangeUsed: false,
        value: 7
    },
    {
        title: 'месяц',
        change: '',
        isChangeUsed: false,
        value: 30
    }
]

class DataPicker {
    constructor() {
        this.date = new Date().toString()
        this.points = Date.now()
        this.weekday = new Date().toString().split(' ')[0]
    }
    
    move(period, key = '+', num = 1) {
        let finden = this.find(period)
        
        if (finden !== undefined) {
            this.points = eval(`${this.points}${key}${finden.value}*${num}*${day_value}`)
        }
       
        let new_date = new Date(this.points).toString()
        
        this.date = new_date
        this.weekday = new_date.split(' ')[0]
        
        return this
    }
    
    bunch(period, key = '+', num = 1, start_day = null) {
        let finden = this.find(period)
        let arr = []
        let initial_points = Date.now()
     
        if (start_day !== null) {
            let own_idx = days.indexOf(new Date().toString().split(' ')[0])
            let start_idx = days.indexOf(start_day)
            
            let diff = Math.abs(own_idx - start_idx)
            
            initial_points += own_idx < start_idx ? 
                parseInt(diff * day_value) 
            : 
                parseInt((7 - diff) * day_value) 
        }
    
        for (let i = 0; i < num; i++) {
            let current = eval(`${initial_points}${finden.isChangeUsed ? finden.change : key}(${finden.value}*${i}*${day_value})`)
            
            arr = [...arr, new Date(current).toString()]
        }
        
        return arr
    }

    diff(start, end, format = 'default', stage = 'year') {
        let result = Math.abs(this.read(start, format) - this.read(end, format))

        return this.toAge(result, stage)
    }
    
    format(title = 'default', date = null) {
       
        date = date === null ? this.date : date
       
        if (title === 'default') {
            return date
        } else if (title === 'letter') {
            
            let parts = date.split(' ')
            
            let num = this.num_check(parts[2])
            let month = this.num_check(months.indexOf(months.find(el => el.title === parts[1])) + 1)
            let year = parts[3]
            
            return `${num}.${month}.${year}`
        }
    }
    
    num_check(num) {
        num = parseInt(num) 
        return num < 10 ? `0${num}` : num 
    }
    
    find(period) {
        let finden = periods.find(el => el.title.toLowerCase().includes(period.toLowerCase()) && el.title.split(period)[0].length === 0) 
        
        return finden || null
    }

    read(data, format = 'default') {
        let num = 0
        let month = 0
        let year = 0

        if (format === 'default') {

            let parts = data.split(' ')
            let period = months.find(el => el.title === parts[1])
    
            num = parseInt(parts[2]) * day_value 
            month = (months.indexOf(period) + 1) * day_value * period.value
            year = parseInt(parts[3]) * 365 * day_value
        } else if (format === 'letter') {
            let parts = data.split('.')
            let period = months[parts[1] - 1]

            num = parseInt(parts[0]) * day_value 
            month = (parts[1] - 1) * day_value * period.value
            year = parseInt(parts[2]) * 365 * day_value
        }

        return num + month + year 
    }

    isWeekday(day) {
        return this.date.split(' ')[0] === day
    }

    toAge(num, stage = 'year') {
        if (stage === 'year') {
            return parseInt(num / (day_value * 365))    
        }
    }
}

module.exports = {DataPicker, periods, day_value, days}