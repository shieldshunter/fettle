// DynamicPatchForm.ts
import React from 'react';
import { useForm } from 'react-hook-form';

export interface DynamicFormProps { initial: Record<string, any>; onSubmit: (d:any)=>void; }

export const DynamicPatchForm: React.FC<DynamicFormProps> = ({ initial, onSubmit }) => {
  const { register, handleSubmit } = useForm({ defaultValues: initial });

  return React.createElement(
    'form',
    { className: 'jb2-form', onSubmit: handleSubmit(onSubmit) },
    ...Object.entries(initial).map(([k, v]) =>
      React.createElement(
        'div',
        { className: 'field', key: k },
        React.createElement('label', null, k),
        React.createElement('input', { ...register(k), defaultValue: v as any })
      )
    ),
    React.createElement('button', { type: 'submit' }, 'Submit to JobBOSS²')
  );
};
