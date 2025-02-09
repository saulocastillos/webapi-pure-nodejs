const http = require('http')
const PORT = 3000
const DEFAULT_HEADER = { 'Content-type': 'application/json' }
const HeroFactory = require('./factories/heroFactory')
const heroService = HeroFactory.generateInstance()
const Hero = require('./entities/hero')


const routes = {
    '/heroes:get': async (request, response) => {
        const { id } = request.queryString
        const heroes = await heroService.find(id)
        response.write(JSON.stringify({ results: heroes }))
        return response.end()
    },
    '/heroes:post': async (request, response) => {
        try {
            // async iterator
            for await (const data of request) {
                // await Promise.reject('/heroes:get')
                const item = JSON.parse(data)
                const hero = new Hero(item)
                const { error, valid } = hero.isValid()
                if (!valid) {
                    response.writeHead(400, DEFAULT_HEADER)
                    response.write(JSON.stringify({ error: error.join(',') }))
                    return response.end()
                }

                const id = await heroService.create(hero);
                response.writeHead(200, DEFAULT_HEADER)
                response.write(JSON.stringify({ success: " User created with sucess!", id }))


                // só jogamos o return aqui pois sabemos que é um objeto body por requisição
                // se fosse um arquvo, que sobe sob demanda
                // ele poderia entrar mais vezes em um mesmo evento, aí removeriamos o return
                return response.end()
            }
        } catch (error) {
            return handleError(response)(error)
        }
    },
    default: (request, response) => {
        response.write('Route not found!')
        response.end();
    }
}

const handleError = response => {
    return error => {
        console.error('Deu ruim!***', error)
        response.writeHead(500, DEFAULT_HEADER)
        response.write(JSON.stringify({ "error": 'Internal Server Error!!' }))
        return response.end()
    }
}

const handler = (request, response) => {
    const { url, method } = request;
    response.writeHead(200, DEFAULT_HEADER)

    const [first, route, id] = url.split('/');
    const key = `/${route}:${method.toLowerCase()}`
    request.queryString = { id: isNaN(id) ? id : Number(id) }

    const chosen = routes[key] || routes.default

    return chosen(request, response).catch(handleError(response))
}

http.createServer(handler).listen(PORT, () => console.log("server running at", PORT))