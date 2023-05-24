import React from "react";
import { Order, OrderItem } from "~/models/Order";
import axios from "axios";
import { useParams } from "react-router-dom";
import PaperLayout from "~/components/PaperLayout/PaperLayout";
import Typography from "@mui/material/Typography";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { AvailableProduct } from "~/models/Product";
import ReviewOrder from "~/components/pages/PageCart/components/ReviewOrder";
import { OrderStatus, ORDER_STATUS_FLOW } from "~/constants/order";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Field, Form, Formik, FormikProps } from "formik";
import Grid from "@mui/material/Grid";
import TextField from "~/components/Form/TextField";
import Box from "@mui/material/Box";
import { useQuery } from "react-query";
import { useInvalidateOrder, useUpdateOrderStatus } from "~/queries/orders";

type FormValues = {
  status: OrderStatus;
  comment: string;
};

export default function PageOrder() {
  const { id } = useParams<{ id: string }>();
  const {
    data: order,
    isLoading,
  } = useQuery({
    queryKey: ["order", { id }],
    queryFn: async () => {
      const res = await axios.get<Order>(`${API_PATHS.order}/order/${id}`);
      return res.data;
    },
  });
  const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();
  const invalidateOrder = useInvalidateOrder();

  if (isLoading) return <p>loading...</p>;

  const orderStatus = order.status;

  return order ? (
    <PaperLayout>
      <Typography component="h1" variant="h4" align="center">
        Manage order
      </Typography>
      <ReviewOrder address={order.delivery.address} items={order.cart.items} />
      <Typography variant="h6">Status:</Typography>
      <Typography variant="h6" color="primary">
        {orderStatus.toUpperCase()}
      </Typography>
      <Typography variant="h6">Change status:</Typography>
      <Box py={2}>
        <Formik
          initialValues={{ status: orderStatus, comment: "" }}
          enableReinitialize
          onSubmit={(values) =>
            updateOrderStatus(
              { id: order.id, ...values },
              { onSuccess: () => invalidateOrder(order.id) }
            )
          }
        >
          {({ values, dirty, isSubmitting }: FormikProps<FormValues>) => (
            <Form autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="status"
                    label="Status"
                    select
                    fullWidth
                    helperText={
                      values.status === OrderStatus.Approved
                        ? "Setting status to APPROVED will decrease products count from stock"
                        : undefined
                    }
                  >
                    {ORDER_STATUS_FLOW.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="comment"
                    label="Comment"
                    fullWidth
                    autoComplete="off"
                    multiline
                  />
                </Grid>
                <Grid item container xs={12} justifyContent="space-between">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!dirty || isSubmitting}
                  >
                    Change status
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
      <Typography variant="h6">Status history:</Typography>
    </PaperLayout>
  ) : null;
}
