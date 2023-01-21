import {
  Box,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormControlProps,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import React from "react";
import Rating from "../../../components/Rating";

interface RatingFieldProps {
  value: string;
  setValue: (value) => void;
  disabled?: boolean;
  error: any;
  FormControlProps?: FormControlProps;
}

const ratings: FormControlLabelProps[] = [
  {
    value: "L",
    control: <Radio color="primary" />,
    label: <Rating rating={"L"} />,
    labelPlacement: "top",
  },
  {
    value: "10",
    control: <Radio color="primary" />,
    label: <Rating rating={"10"} />,
    labelPlacement: "top",
  },
  {
    value: "12",
    control: <Radio color="primary" />,
    label: <Rating rating={"12"} />,
    labelPlacement: "top",
  },
  {
    value: "14",
    control: <Radio color="primary" />,
    label: <Rating rating={"14"} />,
    labelPlacement: "top",
  },
  {
    value: "16",
    control: <Radio color="primary" />,
    label: <Rating rating={"16"} />,
    labelPlacement: "top",
  },
  {
    value: "18",
    control: <Radio color="primary" />,
    label: <Rating rating={"18"} />,
    labelPlacement: "top",
  },
];

const RatingField: React.FC<RatingFieldProps> = ({
  value,
  disabled,
  setValue,
  error,
  FormControlProps,
}) => {
  return (
    <FormControl
      disabled={disabled === true}
      error={error !== undefined}
      {...FormControlProps}
    >
      <FormLabel component="legend">Classificação</FormLabel>
      <Box paddingTop={1}>
        <RadioGroup
          aria-label="rating"
          value={value}
          onChange={(_, value) => {
            setValue(value);
          }}
          row
        >
          {ratings.map((props, index) => (
            <FormControlLabel key={index} {...props} />
          ))}
        </RadioGroup>
      </Box>

      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};

export default RatingField;
