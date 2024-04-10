import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { useMutation, useQuery } from "react-query";
import { initialValues, validationSchema } from "./FichajesFunciones";
import { useNavigate } from "react-router-dom";
import { MensajeError } from "../../servicios/TratamientoErrores";
import { ErrorGeneral } from "../../componentes/ErrorGeneral/ErrorGeneral";
import { MensajeInformativo } from "../../componentes/MensajeInformativo/MensajeInformativo";
import { Button, TextField, Typography, Grid, Autocomplete } from "@mui/material";
import { GeneralCtx } from "../../contextos/GeneralContext";
import { ActualizarFichaje, CrearFichaje, LeerFichaje } from "../../servicios/RQFichajes";
import { MenuLateral } from "../../componentes/MenuLateral/MenuLateral";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { LeerUsuariosTrabajadores } from "../../servicios/RQTrabajadores";
import "moment/locale/es";
import { useGeolocated } from "react-geolocated";
import moment from "moment";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ConvertirAFechaEs, FormatoFechaEs } from "../../servicios/TratamientoFechas";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";


export const FichajePagina = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [hayError, setHayError] = useState(false);
    const [mensajeError, setMensajeError] = useState("");
    const [hayMensaje, setHayMensaje] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const { getSession } = useContext(GeneralCtx);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleSubmit = async (values) => {
        values.fechaHora = moment(selectedDate).format("YYYY-MM-DD HH:mm:ss");
        if (!values.fichajeId) {
            await crearFichaje.mutateAsync(values);
        } else {
            await actualizarFichaje.mutateAsync(values);
        }
        navigate("/fichajes");
    };

    const formik = useFormik({
        initialValues: initialValues(),
        validationSchema: validationSchema(),
        onSubmit: handleSubmit,
    });

    const salirForm = (e) => {
        if (e) e.preventDefault();
        navigate("/fichajes");
    };

    const actualizarFichaje = useMutation(
        (fichaje) => {
            return ActualizarFichaje(fichaje);
        },
        {
            onError: (error) => {
                console.error(error);
                setMensajeError(MensajeError(error));
                setHayError(true);
            },
        }
    );

    const crearFichaje = useMutation(
        (fichaje) => {
            return CrearFichaje(fichaje);
        },
        {
            onError: (error) => {
                console.error(error);
                setMensajeError(MensajeError(error));
                setHayError(true);
            },
        }
    );

    useQuery(
        ["fichajes", params.fichajeId],
        () => {
            return LeerFichaje(params.fichajeId);
        },
        {
            onSuccess: (data) => {
                formik.setValues({ ...formik.values, ...data.data });
                setSelectedDate(ConvertirAFechaEs(data.data.fechaHora));
            },
            onError: (error, variables, context) => {
                console.error(error);
                setMensajeError(MensajeError(error));
                setHayError(true);
            },
            enabled: params.fichajeId !== "0",
        }
    );
    const [trabajadores, setTrabajadores] = useState([]);
    let trabajadorSeleccionado = null;
    const getTrabajadorIdValue = () => {
        trabajadorSeleccionado = trabajadores.find(
            (i) => i.trabajadorId === formik.values.trabajadorId
        );
        return trabajadorSeleccionado || null;
    };
    useQuery(
        "trabajadores",
        () => {
            return LeerUsuariosTrabajadores();
        },
        {
            onSuccess: (data) => {
                let opcionesTrabajadores = data.data;
                setTrabajadores(opcionesTrabajadores);
            },
            onError: (error) => {
                console.error(error);
                setMensajeError(MensajeError(error));
                setHayError(true);
            },
        }
    );
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: true,
            },
            userDecisionTimeout: 5000,
        });

    return (
        <>
            <MenuLateral>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} mt={4}>
                            <Typography variant="h6">Datos de Fichaje:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: "right" }} mt={4}>
                            <Button color="success"
                                variant="contained" onClick={salirForm}>
                                Salir
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                sx={{ marginLeft: 2 }}
                            >
                                Aceptar
                            </Button>
                        </Grid>
                        <Grid item xs={1}>
                            <TextField
                                fullWidth
                                id="fichajeId"
                                name="fichajeId"
                                label="ID"
                                disabled
                                value={formik.values.fichajeId}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.fichajeId
                                    && Boolean(formik.errors.fichajeId)
                                }
                                helperText={
                                    formik.touched.fichajeId
                                    && formik.errors.fichajeId
                                }
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Autocomplete
                                label="Trabajador"
                                options={trabajadores}
                                value={getTrabajadorIdValue()} 
                                getOptionLabel={(option) => option.nombre}
                                onChange={(e, value) => {
                                    formik.setFieldValue("trabajadorId", value.trabajadorId);
                                }}
                                fullWidth
                                id="trabajadorId"
                                name="trabajadorId"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Elija un trabajador"
                                        error={
                                            formik.touched.trabajadorId &&
                                            Boolean(formik.errors.trabajadorId)
                                        }
                                        helperText={
                                            formik.touched.trabajadorId &&
                                            formik.errors.trabajadorId
                                        }
                                    ></TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <LocalizationProvider
                                dateAdapter={AdapterMoment}
                                adapterLocale="es-ES"
                            >
                                <DateTimePicker
                                    renderInput={(props) =>
                                        <TextField {...props} />}
                                    label="Fecha de fichaje"
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        setSelectedDate(newValue);
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                             
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                id="tipo"
                                name="tipo"
                                label="Tipo de fichaje"
                                value={formik.values.tipo}
                                onChange={formik.handleChange}
                                error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                                helperText={formik.touched.tipo && formik.errors.tipo}
                            />     
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                id="latitud"
                                name="latitud"
                                label="Latitud"
                                value={formik.values.latitud}
                                onChange={formik.handleChange}
                                error={formik.touched.latitud && Boolean(formik.errors.latitud)}
                                helperText={formik.touched.latitud && formik.errors.latitud}
                            />
                        </Grid>
                        <Grid item xs={4} md={4}>
                            <TextField
                                fullWidth
                                id="longitud"
                                name="longitud"
                                label="Longitud"
                                value={formik.values.longitud}
                                onChange={formik.handleChange}
                                error={formik.touched.longitud && Boolean(formik.errors.longitud)}
                                helperText={formik.touched.longitud && formik.errors.longitud}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}></Grid>
                        <Grid item xs={12} sx={{ textAlign: "right" }}>
                            <Button color="success" variant="contained"
                                onClick={salirForm}>
                                Salir
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                sx={{ marginLeft: 2 }}
                            >
                                Aceptar
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Grid item xs={12} mt={2}>
                    <ErrorGeneral
                        hayError={hayError}
                        mensajeError={mensajeError}
                        cerrarError={() => setHayError(false)}
                    />
                    <MensajeInformativo
                        hayMensaje={hayMensaje}
                        mensaje={mensaje}
                        cerrarMensaje={() => setHayMensaje(false)}
                    />
                </Grid>
            </MenuLateral>
        </>
    );
};