import { Request, Response } from 'express';

function indexWelcome (req: Request, res : Response)  {
    res.send('Hello World!');
}

export default {
    indexWelcome
};
