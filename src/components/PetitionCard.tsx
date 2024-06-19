
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, Chip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";

export default function PetitionCard({petition, category}:
{ petition: Petition, category: string | undefined}) {
    const navigate = useNavigate();

    return (
        <Card>
            <CardActionArea onClick={() => navigate(`/petitions/${petition.petitionId}`)}>
                <CardMedia
                    component='img'
                    height='140'
                    image={`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${petition.petitionId}/image`}
                    alt={`${petition.title}'s image`}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 1,
                        p: 1
                    }}
                >
                    <Chip variant={'filled'} label={category}
                          sx={{
                              height: 'auto',
                              '& .MuiChip-label': {
                                  display: 'block',
                                  whiteSpace: 'normal',
                              },
                              overflowWrap: 'break-word',
                              p: 1,
                              color: 'white',
                              backgroundColor: 'rgba(0, 0, 0, 0.6)'
                          }}
                    />
                </Box>
                <CardContent sx={{ display: "flex", flexDirection: "column", justifyContent: 'space-between', textAlign: 'left', minHeight: 118 }}>
                    <Typography variant='h6' component='div'
                                sx={{
                                    overflowWrap: 'break-word'
                                }}>
                        {petition.title}
                    </Typography>
                    <Container disableGutters sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Avatar sx={{ mr: 1 }}
                                src={`https://seng365.csse.canterbury.ac.nz/api/v1/users/${petition.ownerId}/image`}
                        />
                        <Container disableGutters>
                            <Typography variant='body1' component='div'>
                                {petition.ownerFirstName} {petition.ownerLastName}
                            </Typography>
                            <Typography sx={{ ml: 'auto' }} variant='body2' component='div'>
                                {new Date(petition.creationDate).toLocaleDateString('en-nz', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                })}
                            </Typography>
                        </Container>
                        <Typography variant='h5' component='div'
                                    sx={{
                                        borderRadius: '10px',
                                        bgcolor: 'goldenrod',
                                        color: 'white',
                                        px: 1,
                                        py: 0.5,
                                        ml: 1
                                    }}>
                            ${petition.supportingCost}
                        </Typography>
                    </Container>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
//
//
// import * as React from 'react';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// import Typography from '@mui/material/Typography';
// import {Button, CardActionArea, CardActions, Chip} from '@mui/material';
// import Avatar from '@mui/material/Avatar';
// import Container from '@mui/material/Container';
// import Box from '@mui/material/Box';
// import {useNavigate} from "react-router-dom";
//
// const PetitionCard: React.FC<{ petition: Petition, category: String | undefined}> = ({ petition, category}) => {
//     const navigate = useNavigate();
//
//     return (
//         <Card>
//             <CardActionArea onClick={() => navigate(`/petitions/${petition.petitionId}`)} >
//                 <CardMedia
//                     component='img'
//                     height='140'
//                     image={`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${petition.petitionId}/image`}
//                     alt={`${petition.title}'s image`}
//                 />
//                 <Box
//                     sx={{
//                         position: 'absolute',
//                         top: 0,
//                         right: 0,
//                         zIndex: 1,
//                         p: 1
//                     }}
//                 >
//                     <Chip variant={'filled'} label={category}
//                           sx={{
//                               height: 'auto',
//                               '& .MuiChip-label': {
//                                   display: 'block',
//                                   whiteSpace: 'normal',
//                               },
//                               overflowWrap: 'break-word',
//                               p: 1,
//                               color: 'white',
//                               backgroundColor: 'rgba(0, 0, 0, 0.6)'
//                           }}
//                     />
//                 </Box>
//                 <CardContent sx={{ display: "flex", flexDirection: "column", justifyContent: 'space-between', textAlign: 'left', minHeight: 118 }}>
//                     <Typography variant='h6' component='div'
//                                 sx={{
//                                     overflowWrap: 'break-word'
//                                 }}>
//                         {petition.title}
//                     </Typography>
//                     <Container disableGutters sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
//                         <Avatar sx={{ mr: 1}}
//                                 src={`https://seng365.csse.canterbury.ac.nz/api/v1/users/${petition.ownerId}/image`} />
//                         <Container disableGutters>
//                             <Typography variant='body1' component='div'>
//                                 {petition.ownerFirstName} {petition.ownerLastName}
//                             </Typography>
//                             <Typography sx={{ ml: 'auto' }} variant='body2' component='div'>
//                                 {new Date(petition.creationDate).toLocaleDateString('en-nz', {
//                                     day: '2-digit',
//                                     month: '2-digit',
//                                     year: '2-digit'
//                                 })}
//                             </Typography>
//                         </Container>
//                         <Typography variant='h5' component='div'
//                                     sx={{
//                                         borderRadius: '10px',
//                                         bgcolor: 'goldenrod',
//                                         color: 'white',
//                                         px: 1,
//                                         py: 0.5,
//                                         ml: 1
//                                     }}>
//                             ${petition.supportingCost}
//                         </Typography>
//                     </Container>
//                 </CardContent>
//             </CardActionArea>
//         </Card>
//     );
// }
//
// export default PetitionCard;
