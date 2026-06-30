import { useEffect, useRef, useState } from 'react';

type CopyButtonProps = {
  label: string;
  disabled?: boolean;
  onCopy: () => Promise<void> | void;
};

export function CopyButton({ label, disabled = false, onCopy }: CopyButtonProps) {
  const [button_label, setButtonLabel] = useState(label);
  const reset_timer_ref = useRef<number | null>(null);

  useEffect(() => {
    setButtonLabel(label);
  }, [label]);

  useEffect(() => {
    return () => {
      if (reset_timer_ref.current !== null) {
        window.clearTimeout(reset_timer_ref.current);
      }
    };
  }, []);

  function scheduleLabelReset() {
    if (reset_timer_ref.current !== null) {
      window.clearTimeout(reset_timer_ref.current);
    }

    reset_timer_ref.current = window.setTimeout(() => {
      setButtonLabel(label);
      reset_timer_ref.current = null;
    }, 2000);
  }

  async function handleCopy() {
    try {
      await onCopy();
      setButtonLabel('Copied to clipboard');
      scheduleLabelReset();
    } catch {
      setButtonLabel('Copy failed');
      scheduleLabelReset();
    }
  }

  return (
    <button
      type="button"
      className="button-secondary"
      onClick={handleCopy}
      disabled={disabled}
    >
      {button_label}
    </button>
  );
}
