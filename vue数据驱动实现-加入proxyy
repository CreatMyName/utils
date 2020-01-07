/*
 * @Author: hou
 * @Date: 2019-11-18 15:40:01 
 * @Last Modified by: hou
 * @Last Modified time: 2019-12-24 14:06:48
 */
const drive = function(){
    let page = null
    /**
     * defin 观察发布
     * @param { String } type 支持object和array两个参数
     * @param { Object } data 拦截的对象
     * @param { String } key 拦截的字段名或方法名
     * @param { more } val 拦截参数或value方法
     */   
    function define(isarr,data,key,val){
        let handle = {
            enumerable:true,
            configurable:true
        }
        if(!isarr){
            handle.get = function (){
                return val
            }
            handle.set = function (newval){
                if(newval === val || (newval !== newval && value !== value)) return 
                let type = typeof val !== typeof newval
                /** 判断set值 方便做二次监听 */
                if(type && typeof newval === 'object'){
                    Array.isArray(newval) ? observeArr(newval) : newval = proxy(newval)
                }
                val = newval
                /* 渲染 */
                render('from defin object')
                return 
            }
        }else{
            handle.writable = true
            handle.value = val || function(...args){
                const res = Array.prototype[key].apply(this, args)
                /* 渲染 */
                render('from defin array')
                return res
            }
        }
        Object.defineProperty(data,key,handle)
    }

    /**
     * 数组拦截
     * @param { Array } target  
     */
    function observeArr(target){
        /** 拦截数组的方法 */
        const interceptMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']
        /** 创建Array对象，由Array的原型创建 */
        const arrayMethods = Object.create(Array.prototype)
        /** 逐个设置拦截 */
        interceptMethods.forEach(item => define(true,  arrayMethods, item))
        /** __proto__指向被拦截的数组原型 */
        '__proto__' in {} ? target.__proto__ = arrayMethods : interceptMethods.forEach(item => define(true, target, interceptMethods[item], arrayMethods[interceptMethods[item]]))
    }

    /** 代理拦截 */
    function proxy(value){
        initDrive(value)
        return new Proxy(value,{
            set(targit,prot,val,receiver){
                let isset = Reflect.set(targit,prot,val,receiver)
                /**新值进行拦截 */
                if(typeof targit[prot] === 'object'){
                    Array.isArray(targit[prot]) ? observeArr(targit[prot]) : val = proxy(targit[prot])
                    isset = Reflect.set(targit,prot,val,receiver)
                }else{
                    define(false, targit, prot, val)
                }
                /**自定义操作 */
                render('from proxy')
                return isset
            }
        })
    }
    
    /** 初始化数据拦截 */
    function initDrive(data){
        for(var key in data){
            data[key] === null || data[key] === undefined ? data[key] = '' : null
            if(typeof data[key] === 'object'){
                Array.isArray(data[key]) ? observeArr(data[key]) : data[key] = proxy(data[key])
            }else{
                define(false, data, key, data[key])
            }
        }
    }

    /** 订阅者 */
    function render(from){
        // console.log(page.data)
        console.log('渲染一下！' + from)
    }

    /** 驱动器对外接口 */
    class DataDrive{
        constructor(page){
            page = page
            page.data = proxy(page.data)
        }
        $set(data,key,value){
            console.warn(`此功能接口暂未开放，敬请期待~`)
        }
    }

    return DataDrive
}
// export default drive()
