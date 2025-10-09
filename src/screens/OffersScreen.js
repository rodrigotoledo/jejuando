import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, Linking } from 'react-native';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import AppContainer from '../components/AppContainer';
import { paperTheme } from '../utils/paperTheme';
import TextContainer from '../components/TextContainer';

// ⚠️ Coloque aqui seu domínio e token do Shopify Storefront
const SHOPIFY_DOMAIN = "3u5a57-cv.myshopify.com";
const STOREFRONT_TOKEN = "4e79201e92ec453f65be7b567880be27"; 

const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`;

const queryProducts = `
  {
  products(first: 10, query: "vendor:'BELLES' OR vendor:'belles' OR vendor:'DECHELLES' OR vendor:'dechelles'") {
    edges {
      node {
        id
        title
        vendor
        handle
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
    }
  }
}
`;
const OffersScreen = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: queryProducts }),
      });

      const json = await response.json();
      const nodes = json.data.products.edges.map(edge => edge.node);

      // Agrupa por vendor
      const grouped = nodes.reduce((acc, product) => {
        const brand = product.vendor || "Sem Marca";
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(product);
        return acc;
      }, {});

      // Transforma em seções
      const formatted = Object.keys(grouped).map(vendor => ({
        title: vendor,
        data: grouped[vendor],
      }));

      setSections(formatted);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openProduct = (handle) => {
    const url = `https://${SHOPIFY_DOMAIN}/products/${handle}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <AppContainer>
      <TextContainer>
        Ofertas
      </TextContainer>

      <SectionList
        className="p-2"
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-2xl my-4 text-secondary font-andada-bold">
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            {item.images.edges[0]?.node?.url && (
              <Card.Cover source={{ uri: item.images.edges[0].node.url }} />
            )}
            <Card.Content>
              <Text style={{ fontWeight: "bold", color: paperTheme.light.colors.onSurface }}>
                {item.title}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor={paperTheme.light.colors.primary}
                textColor={paperTheme.light.colors.onPrimary}
                onPress={() => openProduct(item.handle)}
              >
                Ver mais
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </AppContainer>
  );
};

export default OffersScreen;