import { Response } from 'express';

function indexWelcome (res : Response)  {
    res.send('Hello World!');
}

export default {
    indexWelcome
};
