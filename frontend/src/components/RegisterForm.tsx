import { useForm } from "react-hook-form";

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    password: string;
}

export default function RegisterForm() {
    const { register, handleSubmit } = useForm<FormValues>();

    const onSubmit = (data: FormValues) => {
        console.log(data);
        // A rajouter plus tard, envoyer a l'api
    }

    return (
        <div id="register-form">
            <h1>Register</h1>    
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="firstname">First name : </label>
                <input {...register("firstName")} placeholder="John" id="firstname" /><br />
                <label htmlFor="lastname">Last name : </label>
                <input {...register("lastName")} placeholder="Doe" id="lastname"/><br />
                <label htmlFor="email">Email : </label>
                <input {...register("email")} placeholder="John.Doe@gmail.com" id="register-email" /><br />
                <label htmlFor="age">Age : </label>
                <input {...register("age")} placeholder="55" type="number" id="age" /><br />
                <label htmlFor="password">Password : </label>
                <input {...register("password")} placeholder="Password" type="password" id="register-password" /><br />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}