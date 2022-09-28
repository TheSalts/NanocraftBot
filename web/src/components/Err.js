import { Stack, Flex, Box, Text } from '@chakra-ui/layout';
import { useMediaQuery } from '@chakra-ui/media-query';
import React from 'react';

function Err() {
  const [isNotSmallerScreen] = useMediaQuery('(min-width:600px)');

  return (
    <Stack>
      <Flex
        direction={isNotSmallerScreen ? 'row' : 'column'}
        spacing="200px"
        p={isNotSmallerScreen ? '32' : '0'}
        alignSelf="flex-start"
      >
        <Box mt={isNotSmallerScreen ? '0' : 16} align="flex-start">
          <Text
            fontSize="7xl"
            fontWeight="bold"
            bgGradient="linear(to-r, red.400, orange.500, yellow.600)"
            bgClip="text"
            textAlign="center"
          >
            Error!
          </Text>
          <Text fontSize="5xl" fontWeight="bold">
            some error occured
          </Text>
        </Box>
      </Flex>
    </Stack>
  );
}

export default Err;
