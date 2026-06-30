import { isLikelyEncryptedValue } from '../utils/encryptionService';

type SecretFieldInputProps = {
  label: string;
  value: string;
  is_already_encrypted: boolean;
  placeholder?: string;
  onChange: (value: string, is_already_encrypted: boolean) => void;
};

export function SecretFieldInput({
  label,
  value,
  is_already_encrypted,
  placeholder,
  onChange,
}: SecretFieldInputProps) {
  const looks_encrypted = is_already_encrypted || isLikelyEncryptedValue(value);

  return (
    <label>
      {label}
      <input
        type="password"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          const next_value = event.target.value;
          onChange(next_value, isLikelyEncryptedValue(next_value));
        }}
      />
      <span className={`secret-status ${looks_encrypted ? 'encrypted' : 'plain'}`}>
        {looks_encrypted ? 'Encrypted value detected' : 'Plaintext (encrypt on copy if enabled)'}
      </span>
    </label>
  );
}
