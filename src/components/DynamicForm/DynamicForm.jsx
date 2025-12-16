import { useCallback } from 'react';
import FieldRenderer from './FieldRenderer';

export default function DynamicForm({
  schema,
  formData,
  setFormData,
  errors,
  onChange,
}) {
  const defaultChangeHandler = useCallback(
    (name, value) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setFormData],
  );

  // Use parent handler if provided
  const handleChange = onChange || defaultChangeHandler;

  return (
    <div className="flex flex-col gap-4">
      {schema.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={formData[field.name]}
          onChange={handleChange}
          error={errors?.[field.name]}
        />
      ))}
    </div>
  );
}
