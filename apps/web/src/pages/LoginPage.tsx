import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { FormError } from '../components/FormError';
import { validateEmail } from './validation';
import styles from './AuthForm.module.css';

type Errors = { email?: string; password?: string };

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempt((n) => n + 1);
    setServerError('');

    const next: Errors = {
      email: validateEmail(email),
      password: password ? undefined : 'Введите пароль',
    };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      // После входа GuestOnly сам перенаправит к колодам
      await login(email, password);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось войти');
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Вход">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          shakeKey={attempt}
        />
        <TextField
          label="Пароль"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          shakeKey={attempt}
        />
        {serverError && <FormError message={serverError} />}
        <Button type="submit" fullWidth loading={submitting}>
          Войти
        </Button>
      </form>
      <p className={styles.switch}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </AuthLayout>
  );
}
