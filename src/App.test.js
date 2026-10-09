import { projectCases } from './data/projectCases';

test('all project slugs and bilingual case copy are complete', () => {
  expect(new Set(projectCases.map(project => project.slug)).size).toBe(projectCases.length);
  for (const project of projectCases) {
    for (const language of ['en', 'nl']) {
      expect(project[language].intro).toBeTruthy();
      expect(project[language].story).toBeTruthy();
      expect(project[language].features.length).toBeGreaterThan(0);
    }
  }
});

test('new projects and accurate availability are present', () => {
  expect(projectCases.find(project => project.slug === 'sjmoeleboek').status).toBe('Live');
  expect(projectCases.find(project => project.slug === 'publion').url).toBe('https://github.com/Jaymian-Lee/publion');
  expect(projectCases.find(project => project.slug === 'slecto').status).toBe('In use');
  expect(projectCases.find(project => project.slug === 'vizualy').status).toBe('Pilot');
});

test('Deurwebshop is grounded and the showcase leads with business work', () => {
  expect(projectCases.slice(0, 5).map(p => p.slug)).toEqual(['corthex', 'slecto', 'vizualy', 'deurwebshop', 'martijnkozijn']);
  const door = projectCases.find(p => p.slug === 'deurwebshop');
  expect(door.role).toBe('Developer at MartijnKozijn');
  expect(door.nl.features[2].text).toContain('indicatief');
  expect(door.gallery.length).toBe(1);
});
