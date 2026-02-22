import { redirect } from "next/navigation";

// La ruta raíz redirige al dashboard (el middleware proxy protegerá si no hay sesión)
export default function Home() {
  redirect("/dashboard");
}
