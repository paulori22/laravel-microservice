import React, {
  MutableRefObject,
  RefAttributes,
  useImperativeHandle,
  useRef,
} from "react";

import { Button, FormControl, FormControlProps } from "@material-ui/core";
import InputFile, { InputFileComponent } from "../../../components/InputFile";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

interface UploadFieldProps extends RefAttributes<UploadFieldComponent> {
  accept: string;
  label: string;
  setValue: (value) => void;
  disabled?: boolean;
  error?: any;
  FormControlProps?: FormControlProps;
}

export interface UploadFieldComponent {
  clear: () => void;
}

const UploadField = React.forwardRef<UploadFieldComponent, UploadFieldProps>(
  (props, ref) => {
    const { accept, label, disabled, setValue, error, FormControlProps } =
      props;
    const fileRef = useRef() as MutableRefObject<InputFileComponent>;

    useImperativeHandle(ref, () => ({
      clear: () => fileRef.current.clear(),
    }));

    return (
      <FormControl
        disabled={disabled === true}
        error={error !== undefined}
        fullWidth
        margin="normal"
        {...FormControlProps}
      >
        <InputFile
          ref={fileRef}
          TextFieldProps={{
            label,
            InputLabelProps: { shrink: true },
            style: { backgroundColor: "#ffffff" },
          }}
          InputFileProps={{
            accept,
            onChange(event) {
              const files = event.target.files;
              files?.length && setValue(files[0]);
            },
          }}
          ButtonFile={
            <Button
              endIcon={<CloudUploadIcon />}
              variant="contained"
              color="primary"
              onClick={() => {
                fileRef.current.openWindow();
              }}
            >
              Adicionar
            </Button>
          }
        />
      </FormControl>
    );
  }
);

export default UploadField;
