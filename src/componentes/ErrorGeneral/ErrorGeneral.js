import { Alert, Snackbar } from '@mui/material';
import React from 'react';
import { v4 as uuid } from "uuid";

export const ErrorGeneral = (props) => {

    return (
        <>
            <Snackbar key={uuid()} open={props.hayError} autoHideDuration={10000}
                onClose={props.cerrarError}
                anchorOrigin={{ vertical: 'top', horizontal: 'left', }}>
                <Alert onClose={props.cerrarError} severity="error"
                    sx={{ width: '100%', marginTop: 10 }}>
                    {props.mensajeError}
                </Alert>
            </Snackbar>
        </>
    )
}
