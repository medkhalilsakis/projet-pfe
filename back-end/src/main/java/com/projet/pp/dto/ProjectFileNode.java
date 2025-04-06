package com.projet.pp.dto;

import com.projet.pp.model.ItemType;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProjectFileNode {
    private Long id;
    private String name;
    private ItemType type;
    private String filePath;
    private List<ProjectFileNode> children = new ArrayList<>();
}
