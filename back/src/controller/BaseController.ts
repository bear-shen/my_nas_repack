class BaseController {
    async get(): Promise<any> {
        return 'general get';
    }

    async set(): Promise<any> {
        return 'general set';
    }
}

export default BaseController;