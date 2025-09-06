import { Modal, TextInput, PasswordInput, Button, Stack, Title } from "@mantine/core";
import { useState } from "react";

export function LoginDialog({ opened, onLogin }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      centered
      radius="lg"
      padding="lg"
      overlayProps={{ blur: 3 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <Title order={3} ta="center">Admin Login</Title>

          <TextInput
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />

          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
