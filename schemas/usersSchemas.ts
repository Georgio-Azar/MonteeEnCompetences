import { z } from "zod";

export const addUserSchema = z.object({
    nom : z.string().min(1),
    prenom : z.string().min(1),
    age : z.number().int().positive(),
    email : z.string().email(),
    password : z.string().min(12)
})

export const modifyUserSchema = z.object({
    nom : z.string().min(1).optional(),
    prenom : z.string().min(1).optional(),
    age : z.number().int().positive().optional(),
    email : z.string().email().optional(),
    password : z.string().min(12).optional()
})