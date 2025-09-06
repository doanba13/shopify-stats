import { useState } from "react";
import { useAuthContext } from "../context/auth-context";

const USERNAME = "vuapod";
const PASSWORD = "maimaimottinhyeu@#123";

export function useAuth() {
  const {authenticated, setAuth} = useAuthContext();
  const [opened, setOpened] = useState(true);

  const login = (username: string, password: string) => {
    if (username === USERNAME && password === PASSWORD) {
      setAuth(true);
      setOpened(false);
    } else {
      alert("Invalid credentials!");
    }
  };

  return { authenticated, opened, login };
}
