import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Container, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    addressLine1: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
  });
  const [error, setError] = useState("");

  // Fetch all addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/addresses");
      setAddresses(response.data);
    } catch (err) {
      setError("❌ Failed to load addresses.");
    }
  };

  // Handle PIN code input and auto-fill city/state
  const handlePinCodeChange = async (e) => {
    const pinCode = e.target.value;
    setFormData({ ...formData, pinCode });

    if (pinCode.length === 6) {
      try {
        const response = await axios.get(`http://localhost:5000/api/pincode/${pinCode}`);
        if (response.data.city && response.data.state) {
          setFormData({
            ...formData,
            pinCode,
            city: response.data.city,
            state: response.data.state,
          });
          setError("");
        } else {
          setError("❌ Invalid PIN code.");
        }
      } catch (err) {
        setError("❌ Failed to fetch city/state. Please check the PIN code.");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/addresses", formData);
      setFormData({
        addressLine1: "",
        city: "",
        state: "",
        country: "India",
        pinCode: "",
      });
      fetchAddresses();
      setError("");
    } catch (err) {
      setError("❌ Failed to save address.");
    }
  };

  return (
    <Container className="mt-4">
      <h1>📍 Smart Address Book</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Address Line 1</Form.Label>
          <Form.Control
            type="text"
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            placeholder="Flat No, Street Name..."
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>PIN Code</Form.Label>
          <Form.Control
            type="text"
            value={formData.pinCode}
            onChange={handlePinCodeChange}
            placeholder="6-digit PIN code"
            maxLength="6"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>State</Form.Label>
          <Form.Control
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Country</Form.Label>
          <Form.Control type="text" value={formData.country} readOnly />
        </Form.Group>

        <Button variant="primary" type="submit">
          ➕ Add Address
        </Button>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Address Line 1</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>PIN Code</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((address) => (
            <tr key={address._id}>
              <td>{address.addressLine1}</td>
              <td>{address.city}</td>
              <td>{address.state}</td>
              <td>{address.country}</td>
              <td>{address.pinCode}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default App;
