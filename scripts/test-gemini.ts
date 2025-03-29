// scripts/test-gemini.ts
import { generateEmbedding, generateInnovationIdea } from "@/app/utils/gemini";

async function testGeminiIntegration() {
  try {
    // Test embedding generation
    console.log('Testing embedding generation...');
    const testText = 'This is a test of the Gemini API embedding functionality';
    const embedding = await generateEmbedding(testText);
    console.log(`Successfully generated embedding with ${embedding.length} dimensions`);
    
    // Test innovation idea generation with mock patents
    console.log('\nTesting innovation idea generation...');
    const mockPatent1 = {
      id: 'test1',
      title: 'Biodegradable Polymer for Food Packaging',
      abstract: 'A biodegradable polymer material derived from plant starches that can be used for food packaging with improved shelf life and reduced environmental impact.',
      filing_date: '2022-05-01',
      cpc_codes: ['C08L3/02', 'B65D65/46']
    };
    
    const mockPatent2 = {
      id: 'test2',
      title: 'Smart Medical Implant with Wireless Monitoring',
      abstract: 'A medical implant with integrated sensors and wireless communication capabilities for real-time monitoring of patient health metrics and drug delivery.',
      filing_date: '2022-03-15',
      cpc_codes: ['A61F2/02', 'A61B5/00']
    };
    
    const innovationIdea = await generateInnovationIdea(mockPatent1, mockPatent2);
    console.log('Successfully generated innovation idea:');
    console.log(JSON.stringify(innovationIdea, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGeminiIntegration();