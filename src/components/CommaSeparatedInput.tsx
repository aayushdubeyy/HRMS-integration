import { useEffect, useState } from 'react';

type CommaSeparatedInputProps = {
  label: string;
  values: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
};

function parseCommaSeparatedValues(raw_text: string): string[] {
  return raw_text
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function valuesToDisplayText(values: string[]): string {
  return values.join(', ');
}

export function CommaSeparatedInput({
  label,
  values,
  placeholder,
  onChange,
}: CommaSeparatedInputProps) {
  const [draft_text, setDraftText] = useState(() => valuesToDisplayText(values));
  const external_text = valuesToDisplayText(values);

  useEffect(() => {
    setDraftText(external_text);
  }, [external_text]);

  function commitValues(raw_text: string) {
    onChange(parseCommaSeparatedValues(raw_text));
  }

  return (
    <label>
      {label}
      <input
        type="text"
        value={draft_text}
        placeholder={placeholder ?? 'value1, value2'}
        onChange={(event) => {
          const next_text = event.target.value;
          setDraftText(next_text);
          commitValues(next_text);
        }}
        onBlur={() => {
          const parsed_values = parseCommaSeparatedValues(draft_text);
          setDraftText(valuesToDisplayText(parsed_values));
          onChange(parsed_values);
        }}
      />
    </label>
  );
}
