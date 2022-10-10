var http = require ('http')
var fs = require('fs')
var url = require('url');
const { text, json } = require('stream/consumers');
const { Hash } = require('crypto');

var port = process.env.PORT || 8888;

var server = http.createServer(function(request,response){
	
	var temp = url.parse(request.url,true)
	var path = temp.pathname
	var query = temp.query
	var method = request.method


	if(path==='/'){
        let string = fs.readFileSync('./index.html','utf8')
        let cookies = request.headers.cookie.split(';')
        let hash = {}
        for(let i=0;i<cookies.length;i++){
            let parts = cookies[i].split('=')
            let key = parts[0]
            let value = parts[1]
            hash[key] = value
        }
        let email = hash.sign-in-email
        let users = fs.readFileSync('./db/users','utf8')
        users = JSON.parse(users)
        let foundUser
        for(let i=0;i<users.length;i++){
            if(users[i].email === email){
                foundUser = users[i]
                break
            }
        }
        if(foundUser){
            string = string.replace('--password--',foundUser.password)
        }else{
            string = string.replace('--password--','不知道')
        }
        response.statusCode = 200
        response.setHeader('Content-Tpye', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
  
    }
    else if(path === '/sign-up' && method === 'GET'){
        let string = fs.readFileSync('./sign-up.html','utf8')
        response.statusCode = 200
        response.setHeader('Content-Tpye', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    }else if(path === '/sign-up' && method === 'POST'){
        creatbody(request).then((body)=>{
            let strings = body.split('&')
            let hash = {}
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value)    //把获取得值里面1%40翻译成@
           })
        let {email,password,passwordfirmation } = hash
         if(email.indexOf('@') === -1){
            response.statusCode = 400 
            response.setHeader('Content-Type', 'application/json;charset=utf-8')
            response.write(`{
                "errors":{
                  "email":"invalid"
            }
         }`) 
        }
        else{
           var users = fs.readFileSync('./db/users','utf-8')
           users = JSON.parse(users)
           try{
            users = JSON.parse(users)
        }catch(exception){
            users = []
        }
           let inUse = false
           for(let i =0; i<users.length;i++){
            let user = users[0]
            if(user.email === email){
                inUse = true;
                break;
            }
           }
           if(inUse){
            response.statusCode = 400
            response.write('amial is user')
            }else{
            users.push({email:email, password:password})
            var usersString = JSON.stringify(users)
            fs.writeFileSync('./db/users',usersString)
            response.statusCode = 200 
           }
            users.push({email:email, password:password})
            var usersString = JSON.stringify(users)
            fs.writeFileSync('./db/users',usersString)
            response.statusCode = 200 
            response.end()    
        }
    })
  }else if(path === '/style.css'){
		let string = fs.readFileSync('./style.css', 'utf8')
        response.statusCode =200
		response.setHeader('Content-Tpye', 'text/css')
		response.write(string)
		response.end()
	}else if(path ==='/xxx'){
		response.statusCode = 200
		response.setHeader('Content-Type', 'text/json;charset=utf-8')
		response.write(
            `{
                "note":{
                    "to":"小谷",
                    "from":"冬冬",
                    "heading":"打招呼",
                    "content":"hi"
                }
            }`
        )
		response.end()
	}else if(path === '/sign-in' && method ==='GET'){
        let string = fs.readFileSync('./sign-in.html','utf8')
        response.statusCode = 200
        response.setHeader('Content-Type','text/html;charset=utf-8')
        response.write(string)
        response.end()
    }else if(path==='/sign-in' && method === 'POST'){
        creatbody(request).then((body)=>{
            let strings = body.split('&')
            let hash = {}
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value)    //把获取得值里面1%40翻译成@
           })
        let {email,password,} = hash
        var users = fs.readFileSync('./db/users','utf-8')
        try{   
            users = JSON.parse(users)
        }catch(exception){
            users = []
        }
        let found
        for(let i = 0;i<users.length;i++){
            if(users[i].email === email && users[i].password ===password){
            found = true
            break
         }
       }
        if(found){
            response.setHeader('set-Cookie',`sign-in-email = ${email};HttpOnly`)
            response.statusCode = 200
        }else{
            response.statusCode = 401
        }
        response.end()
     
    })
    }
    else{

	response.statusCode=404
	response.setHeader('Content-Type','text/html;charset=utf-8')
	response.write('找不到对应得路径，你需要自行修改 inde.js')
	response.end()
	}

	console.log(method + '' + request.url)
    function creatbody(request){
        return new Promise ((resolve,reject)=>{
            let body = []
            request.on('data',(chunk)=>{//拿data得数据（用户输入得信息）
                body.push(chunk);
             }).on('end',()=>{
                body = Buffer.concat(body).toString();
                resolve(body)
        });
        })
    }
})
server.listen(port)
console.log(' 监听 ' + port + ' 成功， 请用空中转体720度然后用电饭煲打开 http://localhost:' + port)

