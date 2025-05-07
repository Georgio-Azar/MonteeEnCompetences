import { z } from "zod";

export const addUserSchema = z.object({
    id : z.string().uuid().optional(),
    nom : z.string().min(1),
    prenom : z.string().min(1),
    age : z.number().int().positive(),
    email : z.string().email(),
    password : z.string().min(8)
})