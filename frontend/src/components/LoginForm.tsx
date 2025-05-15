import { useForm } from "react-hook-form";

type LoginValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit } = useForm<LoginValues>();

  const onSubmit = (data: LoginValues) => {
    console.log("Login:", data);
    // A rajouter plus tard, envoyer a l'api
  };

  return (
    <div id="login-form">
        <h1>Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email">Email : </label>
            <input type="email" {...register("email")} placeholder="example@gmail.com" id="login-email" /><br />
            <label htmlFor="password">Password : </label>
            <input type="password" {...register("password")} placeholder="Password" id="login-password" /><br />
            <button type="submit">Login</button>
        </form>
    </div>
  );
}