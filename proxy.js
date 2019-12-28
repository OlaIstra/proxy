//objects

const person = {
    name: 'Ola',
    job: 'Frontend'
}

const op = new Proxy(person, {
    get(target, prop) {
        console.log(`Getting prop ${prop}`)
        return target[prop]
    },
    set(target, prop, value) {
        if (prop in target) {
            target[prop] = value
        } else {
            throw new Error(`No ${prop} found`)
        }
    },
    has(target, prop) {
        return ['name', 'job'].includes(prop)
    },
    deleteProperty(target, prop) {
        console.log('deleting... ', prop)
        delete target[prop]
        return true
    }
})

// functions

const log = text => `Log: ${text}`

const fp = new Proxy(log, {
    apply(target, thisArg, args) {
        console.log('calling fn...')
        return target.apply(thisArg, args).toUpperCase()
    }
})

//classes

class Person {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
}

const PersonProxy = new Proxy(Person, {
    construct(target, args) {
        console.log('construct...')
        return new Person(new target(...args), {
            get(t, prop) {
                console.log(`getting prop ${prop}`)
                return t[prop]
            }
        })
    }
})

const p = new PersonProxy('Maxim', 30)

// PRACTICAL PART

// wrapper 

const withDefaultValue = (target, defaultValue = 0) => {
    return new Proxy(target, {
        get: (obj, prop) => (prop in obj ? obj[prop] : defaultValue)
    })
}

const position = withDefaultValue({
    x: 10,
    y: 20
}, 0)

// hidden properties 

const withHiddenProps = (target, prefix = '_') => {
    return new Proxy(target, {
        has: (obj, prop) => (prop in obj) && (!prop.startsWith(prefix)),
        ownKeys: obj => Reflect.ownKeys(obj).filter(p => !p.startsWith(prefix)),
        get: (obj, prop, reciever) => (prop in reciever) ? obj[prop] : void 0
    })
}

const data = withHiddenProps({
    name: "Olga",
    age: 18,
    _id: '1111111'
})

// optimization

const IndexedArray = new Proxy(Array, {
    construct(target, [args]) {
        const index = {}
        args.forEach(item => (index[item.id] = item))

        return new Proxy(new target(...args), {
            get(arr, prop) {
                switch (prop) {
                    case 'push':
                        return item => {
                            index[item.id] = item
                            arr[prop].call(arr, item)
                        }
                    case 'findById':
                        return id => index[id]
                    default:
                        return arr[prop]
                }
            }
        })
    }
})

const userData = [
    { id: 11, name: 'Vladilen', job: 'Fullstack', age: 25 },
    { id: 22, name: 'Elena', job: 'Student', age: 22 },
    { id: 33, name: 'Victor', job: 'Backend', age: 23 },
    { id: 44, name: 'Vasilisa', job: 'Teacher', age: 24 }
]
