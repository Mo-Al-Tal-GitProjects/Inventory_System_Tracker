'use client';  

import { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { Box, Typography, Button, Stack, Modal, TextField, IconButton, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { Add, Remove, Search, FilterList } from '@mui/icons-material';
import { doc, getDoc, deleteDoc, updateDoc, setDoc, collection, getDocs, Timestamp } from "firebase/firestore";  // Import Timestamp
import CameraCapture from './CameraCapture';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);  // State for filter modal
  const [itemName, setItemName] = useState("");
  const [dosage, setDosage] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");  // New state for search query
  const [filters, setFilters] = useState({
    name: true,
    dosage: true,
    manufacturer: true,
    batchNumber: true,
  });  // State for selected filters

  const updateInventory = async () => {
    const snapshot = await getDocs(collection(firestore, "inventory")); // Fetch the inventory data
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    console.log(inventoryList);
  };

  const removeItem = async (name) => {
    const docRef = doc(firestore, "inventory", name);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
    }
    
    updateInventory(); // Update inventory after removal
  };

  const addItem = async (name) => {
    const docRef = doc(firestore, "inventory", name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, {
        quantity: 1,
        dosage,
        manufacturer,
        batchNumber,
        expirationDate: Timestamp.fromDate(new Date(expirationDate)),
      });
    }
    
    updateInventory(); // Update inventory after addition
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleFilterOpen = () => setFilterOpen(true);
  const handleFilterClose = () => setFilterOpen(false);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked,
    });
  };

  // Filter the inventory based on the search query and selected filters
  const filteredInventory = inventory.filter((item) => {
    return (
      (filters.name && item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (filters.dosage && item.dosage && item.dosage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (filters.manufacturer && item.manufacturer && item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (filters.batchNumber && item.batchNumber && item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      gap={2}
      p={3}
    >
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%"
          width={500}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)', borderRadius: '10px' }}
        >
          <Typography variant="h6">Add Medication</Typography>
          <TextField 
            label="Medication Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <TextField 
            label="Dosage"
            variant="outlined"
            fullWidth
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
          <TextField 
            label="Manufacturer"
            variant="outlined"
            fullWidth
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />
          <TextField 
            label="Batch Number"
            variant="outlined"
            fullWidth
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
          <TextField 
            label="Expiration Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            fullWidth
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              addItem(itemName);
              setItemName("");
              setDosage("");
              setManufacturer("");
              setBatchNumber("");
              setExpirationDate("");
              handleClose();
            }}
          >
            Add Medication
          </Button>
          <CameraCapture />
          <Box display="flex" alignItems="center" mb={2} gap={2}>
            <TextField 
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <Search />
                ),
              }}
            />
            <IconButton color="primary" onClick={handleFilterOpen}>
              <FilterList />
            </IconButton>
          </Box>
        </Box>
      </Modal>

      <Modal open={filterOpen} onClose={handleFilterClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%"
          width={300}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)', borderRadius: '10px' }}
        >
          <Typography variant="h6">Filter Options</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.name}
                  onChange={handleFilterChange}
                  name="name"
                />
              }
              label="Medication Name"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.dosage}
                  onChange={handleFilterChange}
                  name="dosage"
                />
              }
              label="Dosage"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.manufacturer}
                  onChange={handleFilterChange}
                  name="manufacturer"
                />
              }
              label="Manufacturer"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.batchNumber}
                  onChange={handleFilterChange}
                  name="batchNumber"
                />
              }
              label="Batch Number"
            />
          </FormGroup>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleFilterClose}
          >
            Apply Filters
          </Button>
        </Box>
      </Modal>

      <Typography variant="h2" fontWeight="bold">Pharmaceutical Inventory System</Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 3 }}
      >
        Add Medication
      </Button>

      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <TextField 
          variant="outlined"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <Search />
            ),
          }}
        />
        <IconButton color="primary" onClick={handleFilterOpen}>
          <FilterList />
        </IconButton>
      </Box>

      <Box border="1px solid black" borderRadius="10px" mt={2} width="90%">
        <Box
          width="100%"
          height="60px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderTopLeftRadius="10px"
          borderTopRightRadius="10px"
        >
          <Typography variant="h4" color="#333" fontWeight="bold">
            Inventory Items
          </Typography>
        </Box>
        <Box
          width="100%"
          display="flex"
          bgcolor="#f0f0f0"
          borderBottom="1px solid #ccc"
          padding={2}
          fontWeight="bold"
          sx={{
            '& > *': {
              borderRight: '1px solid #ccc',
              textAlign: 'center',
            },
            '& > *:last-child': {
              borderRight: 'none',
            },
          }}
        >
          <Typography flex={2}>Medication Name</Typography>
          <Typography flex={1}>Dosage</Typography>
          <Typography flex={1}>Quantity</Typography>
          <Typography flex={2}>Expiration Date</Typography>
          <Typography flex={2}>Manufacturer</Typography>
          <Typography flex={2}>Batch Number</Typography>
          <Typography flex={1}></Typography>
        </Box>
        <Stack width="100%" spacing={0} overflow="auto"> 
          {filteredInventory.map(({name, quantity, dosage, expirationDate, manufacturer, batchNumber}) => (
            <Box 
              key={name}
              width="100%" 
              minHeight="60px" 
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={2}
              borderBottom="1px solid #ccc"
              sx={{
                '& > *': {
                  borderRight: '1px solid #ccc',
                  textAlign: 'center',
                },
                '& > *:last-child': {
                  borderRight: 'none',
                },
              }}
            >
              <Typography flex={2}>{name?.charAt(0).toUpperCase() + name.slice(1)}</Typography>
              <Typography flex={1}>{dosage}</Typography>
              <Typography flex={1}>{quantity}</Typography>
              <Typography flex={2}>
                {expirationDate instanceof Timestamp ? expirationDate.toDate().toLocaleDateString() : "Invalid Date"}
              </Typography>
              <Typography flex={2}>{manufacturer}</Typography>
              <Typography flex={2}>{batchNumber}</Typography>
              <Stack direction="row" spacing={1} flex={1} justifyContent="flex-end">
                <IconButton color="primary" onClick={() => addItem(name)}>
                  <Add />
                </IconButton>
                <IconButton color="secondary" onClick={() => removeItem(name)}>
                  <Remove />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
