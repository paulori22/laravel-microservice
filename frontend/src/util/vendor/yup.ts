import { LocaleObject, setLocale } from "yup";

const ptBR: LocaleObject = {
  mixed: {
    required: "${path} é obrigatório",
    notType: "${path} é invalido",
  },
  string: {
    max: "${path} precisa ter no máximo ${max} caracteres",
  },
  number: {
    min: "${path} precisa ser no mínimo ${min}",
  },
};

setLocale(ptBR);

export * from "yup";
