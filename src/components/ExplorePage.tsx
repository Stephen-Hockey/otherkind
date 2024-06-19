import * as React from "react";
import PetitionCardList from "./PetitionCardList";
import axios from "axios";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import {
    Autocomplete,
    AutocompleteChangeReason, Chip,
    InputAdornment,
    TextField, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import ClearIcon from '@mui/icons-material/Clear';
import {ReactNode, Ref, SyntheticEvent} from "react";
import Grid from "@mui/material/Grid";
import ErrorIcon from "@mui/icons-material/Error";

export default function ExplorePage() {
    const [petitions, setPetitions] = React.useState<Array<Petition>>([]);
    const [categories, setCategories] = React.useState<Array<Category>>([]);
    const [autocompleteKey, setAutocompleteKey] = React.useState<number>(0); // rather silly work-around for programmatically clearing the autocomplete element, genuinely could not find another way

    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [filterMaxCost, setFilterMaxCost] = React.useState<string>("");
    const [filterCategories, setFilterCategories] = React.useState<Array<Category>>([]);
    const [sortBy, setSortBy] = React.useState<string>("CREATED");
    const [sortAscending, setSortAscending] = React.useState<boolean>(true);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        getPetitions();
        getCategories();
    }, []);

    React.useEffect(() => {
        getPetitions();
    }, [sortBy, sortAscending]);

    const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value.trim())
    }

    const handleFilterMaxCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterMaxCost(event.target.value.trim());
    }
    const handleFilterCategoriesChange = (event: SyntheticEvent<Element, Event>, categoryNames: string[], reason: AutocompleteChangeReason) => {
        setFilterCategories(categoryNames.map(name => categories.find(c => c.name === name) as Category));
    };

    const handleSortByChange = (event: React.MouseEvent<HTMLElement>, newSortBy: string) => {
        if (newSortBy) {
            setSortBy(newSortBy);
            setSortAscending(true);
        } else {
            setSortAscending(!sortAscending)
        }
    };

    const handleClickClear = () => {
        setSearchQuery("");
        setFilterMaxCost("");
        setFilterCategories([]);
        setAutocompleteKey(prevKey => prevKey + 1);
    }

    const handleClickSearch = () => {
        getPetitions();
    }

    const getPetitions = () => {
        const params: PetitionSearchParams = {};
        params.sortBy = `${sortBy}_${sortAscending ? 'ASC' : 'DESC'}`;
        if (searchQuery !== "") params.q = searchQuery;
        if (filterCategories.length !== 0) params.categoryIds = filterCategories.map(c => c.categoryId);
        if (filterMaxCost !== "") params.supportingCost = parseInt(filterMaxCost, 10);

        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions', { params })
            .then((response) => {
                setErrorMessage("");
                setPetitions(response.data.petitions);
            })
            .catch((error) => {
                setErrorMessage(error.response.statusText)
            });
    };

    const getCategories = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions/categories')
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                // should not error
                console.log(error)
            });
    };

    return (
        <Container disableGutters maxWidth={'xl'}>
            <Container sx={{display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', my: 2}}>
                {errorMessage.trim() !== "" && (
                    <Grid item xs={12}>
                        <Chip icon={<ErrorIcon/>} color={'error'} variant={'outlined'} label={errorMessage}
                              sx={{
                                  height: 'auto',
                                  '& .MuiChip-label': {
                                      display: 'block',
                                      whiteSpace: 'normal',
                                  },
                                  p: 1
                              }}
                        />
                    </Grid>
                )}
                <Container disableGutters sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <TextField id="searchTextField" variant="outlined"
                               sx={{minWidth: 200, width: {xs: '50vw', sm: '40vw'}}}
                               value={searchQuery}
                               onChange={handleSearchQueryChange}
                               InputProps={{
                                   startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>,
                               }}/>
                    <TextField id="minTextField" variant="outlined" type="number"
                               sx={{minWidth: 200, width: {xs: '50vw', sm: '10vw'}}}
                               value={filterMaxCost?.toString()}
                               onChange={handleFilterMaxCostChange}
                               InputProps={{
                                   startAdornment: <InputAdornment position="start">&le;
                                       <AttachMoneyIcon/></InputAdornment>,
                               }}/>
                </Container>

                <Autocomplete
                    key={autocompleteKey}
                    disableCloseOnSelect
                    openOnFocus
                    multiple
                    id={"categoriesAutocomplete"}
                    noOptionsText="No categories found"
                    options={categories.map(c => c.name)}
                    sx={{minWidth: 200, width: '50vw'}}
                    renderInput={(params) =>
                        <TextField {...params} label="Filter by category"
                        />
                    }
                    onChange={handleFilterCategoriesChange}
                />

                <Button startIcon={<ClearIcon />} variant="outlined" onClick={handleClickClear} sx={{fontSize: 'large'}} disabled={searchQuery === '' && filterMaxCost === '' && filterCategories.length === 0}>
                    Clear
                </Button>

                <Container disableGutters sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ToggleButtonGroup
                        value={sortBy}
                        exclusive
                        onChange={handleSortByChange}
                        color="primary"
                    >
                        <ToggleButton value="CREATED">
                            <CalendarMonthIcon/>
                            {sortBy === "CREATED" && (sortAscending ? <NorthIcon/> : <SouthIcon/>)}
                        </ToggleButton>
                        <ToggleButton value="ALPHABETICAL">
                            <SortByAlphaIcon/>
                            {sortBy === "ALPHABETICAL" && (sortAscending ? <NorthIcon/> : <SouthIcon/>)}
                        </ToggleButton>
                        <ToggleButton value="COST">
                            <AttachMoneyIcon/>
                            {sortBy === "COST" && (sortAscending ? <NorthIcon/> : <SouthIcon/>)}
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button startIcon={<SearchIcon />} variant="contained" onClick={handleClickSearch} sx={{fontSize: 'large'}}>
                        Search
                    </Button>
                </Container>
            </Container>
            <PetitionCardList petitions={petitions} categories={categories} cardsPerPage={8}/>
        </Container>
    );
}