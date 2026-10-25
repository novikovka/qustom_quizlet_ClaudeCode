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

type Errors = { email?: string; password?: string; confirm?: string };

const MIN_PASSWORD = 8;

export function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
      password: !password
        ? 'Введите пароль'
        : password.length < MIN_PASSWORD
          ? 'Пароль должен быть не короче 8 символов'
          : undefined,
      confirm: !confirm
        ? 'Повторите пароль'
        : confirm !== password
          ? 'Пароли не совпадают'
          : undefined,
    };
    setErrors(next);
    if (next.email || next.password || next.confirm) return;

    setSubmitting(true);
    try {
      await register(email, password);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось зарегистрироваться');
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Регистрация">
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
          autoComplete="new-password"
          hint="Не короче 8 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          shakeKey={attempt}
        />
        <TextField
          label="Повторите пароль"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          shakeKey={attempt}
        />
        {serverError && <FormError message={serverError} />}
        <Button type="submit" fullWidth loading={submitting}>
          Зарегистрироваться
        </Button>
      </form>
      <p className={styles.switch}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </AuthLayout>
  );
}
