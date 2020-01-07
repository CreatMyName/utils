/*
 * @Author: hou 
 * @Date: 2019-10-22 14:40:01 
 * @Last Modified by: hou
 * @Last Modified time: 2019-12-02 14:06:48
 */
const DBtool = (function(){
    /** this privte methods execute set indexDB */
    function setData(work, db, modelName, data) {
        console.log('执行开始 稍等...')
        let store = db.transaction([modelName], "readwrite").objectStore(modelName)
        let execute = null
        switch (work) {
            case 'add': execute = store.add(data); break;
            case 'put': execute = store.put(data); break;
            case 'del': execute = store.delete(data); break;
            case 'get': execute = store.get(data); break;
            case 'getAll': execute = store.openCursor(); break;
            default:
                break;
        }
        return new Promise((resolve, reject) => {
            let result = []
            execute.onsuccess = work==='getAll'? 
            /** 获取全部数据时 */
            res => {
                /** 遍历当前数据 */
                if(res.target.result){
                    result.push(res.target.result.value)
                    res.target.result.continue();
                }else{
                    /** 回调 */
                    resultData(db,res,result,resolve)
                }
            }:
            /** 执行其他数据时 */
            res => {
                /** 回调 */
                resultData(db,res,res.target.result,resolve)
            }
            execute.onerror = () => reject({ success: false, msg: '操作失败' })
        })
    } 
    /**执行回调并关闭数据库 */
    function resultData(db,res,result,resolve){
        resolve({ 
            success: true, 
            msg: '操作成功' , 
            result,
            target:res
        })
        console.log('执行完毕 断开连接...')
        db.close()
    }
    /**  执行创健仓库---仅在创健和升级数据库时可调用 */
    function  createMoudel(db, modelName, keyPath, autoIncrement) {
        if (!db.objectStoreNames.contains(modelName)) {
            db.createObjectStore(modelName, { keyPath, autoIncrement })
            return true
        }
        console.warn(`创建表${modelName}未成功，原因：已存在该表`)
    }
    /**
     * @deprecated  数据库
     */
    class DBtool {
        constructor(dbName, dbVvrsion) {
            this.dbName = dbName
            this.dbVvrsion = dbVvrsion
        }
        /**  */
        openDB(work, content) {
            /** 支持检测 */
            if (!("indexedDB" in window)) {
                console.error('浏览器暂不支持indexDB数据库')
                return false
            }
            /** 打开IND */
            let openRequest = window.indexedDB.open(this.dbName, this.dbVvrsion)
            /* 创健或或升级时 */
            openRequest.onupgradeneeded = function(e) {
                /** 创健表admin */
                createMoudel(e.target.result, 'admin', 'id', true)
            }
            return new Promise((resolve,reject)=>{
                /** 打开时 */
                openRequest.onsuccess = e => setData(work, e.target.result, content.modelName, content.value).then(res => {
                    resolve(res)
                })
                
                openRequest.onerror = () => reject('打开数据库异常！')
            })
        }
        /** 
         * @description 根据模块新增字段
         * @param {modelName,value} 模块名称，值
         */
        add(modelName, value) { return this.openDB('add', { modelName, value }) }
        /** 
         * @description 根据模块修改字段
         * @param {modelName,value} 模块名称，值
         */
        put(modelName, value) { return this.openDB('put', { modelName, value }) }
        /** 
         * @description 根据模块和id删除字段
         * @param {modelName,value} 模块名称，id
         */
        del(modelName, value) { return this.openDB('del', { modelName, value }) }
        /** 
         * @description 根据模块和key获取数据
         * @param {modelName,value} 模块名称，id
         */
        get(modelName, value) { return this.openDB('get', { modelName, value }) }
        /** 
         * @description 根据模块获取模块下全部数据
         * @param {modelName} 模块名称
         */
        getAll(modelName) { return this.openDB('getAll', { modelName, value:'' }) }
        
    }
    return DBtool
})();
export default new DBtool('jsapp', 1)
