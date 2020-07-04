/*
 * @Author: hou
 * @Date: 2018-11-13 16:05:57
 * @Last Modified by: hou
 * @Last Modified time: 2020-07-04 12:03:06
 */
/** 驱动器对外接口 */
class DataDrive{
    constructor(data, key, render){
        data[key] = data[key] === null || data[key] === undefined ? '' : data[key]
        data[key] = this.resolve(data[key])
        // 'data' in dri ? dri.data.obj[dri.data.key] = this.resolve(dri.data.obj[dri.data.key], dri.data.key, dri.data.obj) : null
        render ? this.renderFun = render : null
        typeof this.renderFun === 'function' ? this.renderFun() : null
    }
    $set(data, key, targit, render){
        targit[key] = this.resolve(data, key, targit)
        this.renderFun = render || null
    }
    /**
     * defin 观察发布
     * @param { String } type 支持object和array两个参数
     * @param { Object } data 拦截的对象
     * @param { String } key 拦截的字段名或方法名
     * @param { more } val 拦截参数或value方法
     */  
    define(isarr,data,key,val){
        let handle = {
            enumerable:true,
            configurable:true
        }
        let _this = this
        if(!isarr){
            handle.get = function (){
                return val
            }
            handle.set = function (newval){
                if(newval === val || (newval !== newval && value !== value)) return 
                let type = typeof val !== typeof newval
                /** 判断set值 方便做二次监听 */
                if(newval === null || newval === undefined){
                    newval = ''
                }
                if(type && newval && typeof newval === 'object'){
                    Array.isArray(newval) ? _this.observeArr(newval) : newval = _this.proxy(newval)
                }
                val = newval
                /* 渲染 */
                _this.render('from defin object')
                return 
            }
        }else{
            handle.writable = true
            handle.value = val || function(...args){
                if(key === 'push'){
                    args = _this.proxy(args)
                }
                const res = Array.prototype[key].apply(this, args)
                /* 渲染 */
                _this.render('from defin array')
                return res
            }
        }
        Object.defineProperty(data,key,handle)
    }
    /**
     * 数组拦截
     * @param { Array } target  
     */
    observeArr(target){
        /** 继续监听子集 */
        target.forEach((item,index) => target[index] = this.resolve(item))
        /** 拦截数组的方法 */
        const interceptMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']
        /** 创建Array对象，由Array的原型创建 */
        const arrayMethods = Object.create(Array.prototype)
        /** 逐个设置拦截 */
        interceptMethods.map(item => this.define(true,  arrayMethods, item))
        /** __proto__指向被拦截的数组原型 */
        '__proto__' in {} ? target.__proto__ = arrayMethods : interceptMethods.map(item => this.define(true, target, interceptMethods[item], arrayMethods[interceptMethods[item]]))
        return target
    }
    /**
     * 数组拦截
     * @param { Array } target  
     */
    proxy(value){
        value instanceof File ? null : this.initDrive(value)
        let _that = this
        return new Proxy(value,{
            set(targit,prot,val,receiver){
                let isset = Reflect.set(targit,prot,val,receiver)
                /**新值进行拦截 */
                if(typeof targit[prot] === 'object' && targit[prot] !== null){
                    Array.isArray(targit[prot]) ? _that.observeArr(targit[prot]) : val = _that.proxy(targit[prot])
                    isset = Reflect.set(targit,prot,val,receiver)
                }else{
                    _that.define(false, targit, prot, val)
                }
                /**自定义操作 */
                _that.render('from proxy')
                return isset
            }
        })
    }
    /** 初始化数据拦截 */
    initDrive(data){
        if(data instanceof File){
            data = this.proxy(data)
            return
        }
        for(var key in data){
            data[key] === null || data[key] === undefined ? data[key] = '' : null
            if(typeof data[key] === 'object'){
                Array.isArray(data[key]) ? this.observeArr(data[key]) : data[key] = this.proxy(data[key])
            }else{
                data[key] === null || data[key] === undefined ? data[key] = '' : null
                this.define(false, data, key, data[key])
            }
        }
    }
    /** 类型 */
    resolve(data, key, targit) {
        if(typeof data !== 'object' || data === null){
            key && targit ? this.define(false, targit, key, data[key]) : null
            return data
        }
        if(Array.isArray(data)){
            return this.observeArr(data)
        } 
        return this.proxy(data)
    }
    /** 订阅者 */
    render(from){
        // console.log('渲染一下！' + from)
        typeof this.renderFun === 'function' ? this.renderFun() : null;
    }
}

export default function(obj, key, render){
    let drive = drive || new DataDrive(obj, key , render)
    return drive
}
